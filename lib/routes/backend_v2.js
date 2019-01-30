var Promise = require('bluebird');
var _ = require('lodash');
var log = require('../utils/log4js').default();
var async = require('async');
//温度
var WsdDataService = require('../services/wsd_data');
var WsdStateService = require('../services/wsd_state');
var WsdlastDataService = require('../services/wsd_lastdata');
//烘箱
var HxDataStateService = require('../services/hx_state_data');
var HxDatalastStateService = require('../services/hx_state_lastdata');
var HxStateService = require('../services/hx_state');
//硫化机1
var LhjStateDataService = require('../services/pblhj_state_data');
var LhjStateService = require('../services/pblhj_state');
var LhjlastStateDataService = require('../services/pblhj_state_lastdata');
//硫化机2
//var Lhj1StateDataService = require('../services/1pblhj_state_data');
//var Lhj1StateService = require('../services/1pblhj_state');
//var Lhj1lastStateDataService = require('../services/1pblhj_state_lastdata');

var ProdProceService = require('../services/prod_proce'); //工序
var monitorUtil = require('../utils/monitorUtil')
var server = require('../routes/server');
//定时器 1分钟
var IntervalTime1 = 10 * 1000; //温湿度
var IntervalTime2 = 20 * 1000;//烘箱历史数据保存
var IntervalTime3 = 20 * 1000;//烘箱实时数据保存
var IntervalTime4 = 20 * 1000;//硫化机历史数据保存
var IntervalTime5 = 20 * 1000;//硫化机实时数据保存

var fg = 0;
var lhstatus = 0; //硫化1
var lh1status = 0; //硫化1
var wsdtatus = 0; //温度
var lhstatushyy = '';
var lhjOffset = [{
  lhjSaveData1Offset: [2200, 2323],
  lhjSaveData2Offset: [2324, 2336],
  lhstatusOffset: [2199, 2199]
}];

// 硫化机标识位
var LHJ_FLAG_1 = -1,
  LHJ_FLAG_2 = -1,
  LHJ_FLAG_3 = -1,
  LHJ_FLAG_4 = -1,
  HX_FLAG = -1;

// 消抖函数
// const updateLHJStateNProce = _.debounce(delayUpdateLHJStateNProce, 150);
// const updateHXStateNProce = _.debounce(delayUpdateHXStateNProce, 150);

var back = {
  init: function() {
    back.wsd();
    back.hx();
    // back.lhj();
  }, //测试
  getrd: function(e, t) {
    var rd = server.getModbusdata();
    var data = new Array();

    for (var i = e; i <= t; i++) {
      if (rd[i]) {
        data.push(rd[i]);
      } else {
        data.push(0);
      }
    }
    // }
    return data;

  },
  getrdtest: function(e, t) {
    var data = new Array();
    for (var i = e; i <= t; i++) {
      data.push(0);
    }
    return data;
  },
  wsd: function() {
    WsdStateService.find().then(function(models) {
      for (let i = 0; i < models.length; i++) {
        back.wsdCallBack(models[i])
      }
    });
  },
  /*温湿度*/
  wsdCallBack: function(wsd) {
    wsdObjId = wsd._id;
    let wsdInterval = '';
    inter();

    function inter() {
      clearTimeout(wsdInterval);
      let data = back.getrd(100, 121)
      let status = back.getrd(99, 99);
      /*温湿度通讯状态*/
      if (wsdtatus != back.getrd(99, 99)[0]) {
        wsdstatushyy = true;
      } else {
        wsdstatushyy = false;
      }
      wsdtatus = back.getrd(99, 99)[0];
      console.log("温湿度通讯状态" + wsdstatushyy);
      console.log("温湿度：" + data);
      if (wsdstatushyy) {
        WsdStateService.findById(wsdObjId)
          .then(function(data) {

            WsdStateService.update(wsdObjId, {
              connectState: 1
            })

          })
      } else {
        WsdStateService.findById(wsdObjId)
          .then(function(data) {
            WsdStateService.update(wsdObjId, {
              connectState: 0
            })

          })
      }
      if (data.length > 0) {

        //存储数据
        let wsdStateData = monitorUtil.handleWsdData(data, wsd.eqIp)
        WsdDataService.save(wsdStateData)
          .then(function() {
            WsdStateService.findById(wsdObjId)
              .then(function(data) {

              })
            wsdInterval = setTimeout(inter, IntervalTime1)
          })
          .catch(function(err) {
            log.error(err);
          });
      } else {
        wsdInterval = setTimeout(inter, IntervalTime1)
        console.log("无数据");

      }
    }
  },
  hx: function() {
    back.hxCallBack()
    HxStateService.find().then(function(models) {
      for (let i = 0; i < models.length; i++) {
        back.hxlastCallBack(models[i], i)
      }
    });
  }, //仪器
  hxCallBack: function() {
    let hx1 = '';
    inter();
    // hx1 = setInterval(inter, IntervalTime2)

    function inter() {
      clearTimeout(hx1);
      HxStateService.find().then(function(model) {
        if (fg != back.getrd(199, 199)[0]) {
          hyy = true;
        } else {
          hyy = false;

        }

        // async.forEachSeries(model, function(models, callback) {
        async.eachSeries(model, function(models, callback) {
          let hxData = models;
          let hxObjId = hxData._id;
          let data = [];
          var tIds = [];
          if (hxData.ybName == "仪表1号") {
            data = back.getrd(200, 217);
            // data = back.getrdtest(201, 217);
            // console.log("烘箱仪器1数据--->>" + data)
          } else if (hxData.ybName == "仪表2号") {
            data = back.getrd(220, 237)
            // data = back.getrdtest(201, 217);
            // console.log("烘箱仪器2数据--->>" + data)
          } else if (hxData.ybName == "仪表3号") {
            data = back.getrd(240, 257);
            //data = back.getrdtest(201, 217);
            // console.log("烘箱仪器3数据--->>" + data);
          }

          hxData.tIds.forEach(i => {
            tIds.push(i.tId);
          });

          // if (tIds.length > 0) {
          console.error('任务号：', tIds, tIds.length);
          let hxStateData = monitorUtil.handleHxData(data);
          let isOpen = (data[7] == 1); //若烘箱状态为启动中
          hxStateData.isLine = isOpen ? 1 : 0;
          hxStateData.hxState = hxObjId;
          hxStateData.tIds = tIds;

          // console.error('存储条件---->>', isOpen, hyy，任务号不为空);
          if (isOpen && hyy && tIds.length != 0) {
            // console.error(hxStateData);
            HxDataStateService.save(hxStateData)
              .then(function(res) {
                let tIds = hxData.tIds;
                if (hxData.connectState != 1) {
                  HxStateService.update(hxObjId, {
                    $set: {
                      connectState: 1
                    }
                  })
                }
                console.error('data[12]的值为：------->>', data[13]);
                // if (data[12] == 100 || data[12] == 0) {
                // 先查询，后改变仪表状态为0空闲中，清空任务号和温度时间
                if ((data[13] == 1 || data[13] == 2) && data[13] != HX_FLAG) {
                  HX_FLAG = data[13];
                  delayUpdateHXStateNProce(data[13], tIds, hxObjId);
                }
                // }

              })
              .catch(function(err) {
                console.error(err);
                log.error(err);
              });
          }
          // }
          callback(null)

        }, function(err) {
          fg = back.getrdtest(199, 199)[0];
          hx1 = setTimeout(inter, IntervalTime2)
        })

      });

    }
  },
  hxlastCallBack: function(models, i) {
    let hx1 = '';
    inter();

    function inter() {
      clearTimeout(hx1);
      HxStateService.find().then(function(model) {
        if (fg != back.getrd(199, 199)[0]) {
          hyy = true;
        } else {
          hyy = false;

        }
        console.log("烘箱通讯状态" + hyy)
        if (hyy) {
          HxStateService.find().then(function(models) {
            for (let i = 0; i < models.length; i++) {
              //hxCallBack(models[i])
              //存储数据
              let hxObjId = models[i]._id;
              HxStateService.findById(hxObjId)
                .then(function(data) {
                  //console.log('run')

                  HxStateService.update(hxObjId, {
                    connectState: 1
                  })
                })
            }
          });
        } else {
          HxStateService.find().then(function(models) {
            for (let i = 0; i < models.length; i++) {
              //hxCallBack(models[i])
              //存储数据
              let hxObjId = models[i]._id;
              HxStateService.findById(hxObjId)
                .then(function(data) {
                  HxStateService.update(hxObjId, {
                    connectState: 0
                  })

                })
            }
          });
        }
      });
      //先查询再更改hxState通讯状态改为1
      //存储数据
      let hxData = models;
      let hxObjId = hxData._id;
      let data = [];
      if (hxData.ybName == "仪表1号") {
        data = back.getrd(200, 217);
        // data = back.getrdtest(201, 217);
        console.log("烘箱仪器1数据" + data)

      } else if (hxData.ybName == "仪表2号") {
        data = back.getrd(220, 237)
        // data = back.getrdtest(201, 237);
        console.log("烘箱仪器2数据" + data)

      } else if (hxData.ybName == "仪表3号") {
        data = back.getrd(240, 257);
        // data = back.getrdtest(201, 257);
        console.log("烘箱仪器3数据" + data);

      }

      var tIds = [];
      hxData.tIds.forEach(i => {
        tIds.push(i.tId);
      });

      let hxStateData = monitorUtil.handleHxData(data);
      let isOpen = (data[7] == 1); //若烘箱状态为启动中
      hxStateData.isLine = isOpen ? 1 : 0;
      hxStateData.hxState = hxObjId;
      HxDatalastStateService.removeState(hxObjId).then(function() {
        hxStateData.tIds = tIds;
        // console.error('hxStateData--->>>', hxStateData);
        HxDatalastStateService.save(hxStateData)
          .then(function(res) {
            // console.error('res--->>>', res);

            hx1 = setTimeout(inter, IntervalTime3)
          })
          .catch(function(err) {
            log.error(err);
            hx1 = setTimeout(inter, IntervalTime3)
          });
      })
    }
  },
  //硫化机1
  lhj: function() {
    LhjStateService.find().then(function(models) {
      for (let i = 0; i < models.length; i++) {
        back.comlhjCallBack(models[i], [2200, 2323], [2324, 2336], [2199, 2199])
        back.comlhjlastCallBack(models[i], [2200, 2323], [2324, 2336], [2199, 2199])
      }
    });
  },

  /**
   * 硫化机回调函数
   * @param  {Object} lhj1                硫化机数据
   * @param  {Array} lhjSaveData1Offset   硫化机串口数据地址1
   * @param  {Array} lhjSaveData2Offset   硫化机串口数据地址2
   * @return
   */
  comlhjCallBack: function(lhj1, lhjSaveData1Offset, lhjSaveData2Offset, lhstatusOffset) {
    let lhjObjId = lhj1._id;
    let eqId = lhj1.eqId;
    let Lhj1 = '';
    inter();

    function inter() {
      clearTimeout(Lhj1);
      let lhjSaveData1 = back.getrd(lhjSaveData1Offset[0], lhjSaveData1Offset[1])
      let lhjSaveData2 = back.getrd(lhjSaveData2Offset[0], lhjSaveData2Offset[1])
      let lhjStateData1 = monitorUtil.handleLhjData1(lhjSaveData1);
      let lhjStateData2 = monitorUtil.handleLhjData2(lhjSaveData2);

      //硫化机通讯状态判断
      if (lhstatus != back.getrd(lhstatusOffset[0], lhstatusOffset[1])[0]) {
        lhstatushyy = true;
      } else {
        lhstatushyy = false;
      }

      let lhjStateData = _.merge(lhjStateData1, lhjStateData2);
      lhjStateData.isLine = lhjSaveData2 ? 1 : 0; //若硫化机状态为启动中
      lhjStateData.lhjState = lhjObjId;
      console.log("硫化机" + lhjObjId)
      console.log("硫化机数据" + lhjSaveData1 + "," + lhjSaveData2)
      
      console.log("硫化标志是" + lhjStateData2.lhbz);
      if (lhjStateData2.lhbz == 1 && lhstatushyy) {
        LhjStateDataService.save(lhjStateData)
          .then(function(res) {
            console.log("硫化机数据写入成功" + lhjSaveData1 + "," + lhjSaveData2)
            lhj1 = setTimeout(inter, IntervalTime4)
          })
          .catch(function(err) {
            log.error(err);
            lhj1 = setTimeout(inter, IntervalTime4)
          });
      } else {
        Lhj1 = setTimeout(inter, IntervalTime4)
      }
    }
  },

  /**
   * 硫化机回调函数
   * @param  {Object} lhj1                硫化机数据
   * @param  {Array} lhjSaveData1Offset   硫化机串口数据地址1
   * @param  {Array} lhjSaveData2Offset   硫化机串口数据地址2
   * @param  {Array} lhstatusOffset       硫化机状态串口数据地址
   * @return
   */
  comlhjlastCallBack: function(lhj1, lhjSaveData1Offset, lhjSaveData2Offset, lhstatusOffset) {
    let lhjObjId = lhj1._id;
    let Lhj1 = '';
    inter();

    function inter() {
      clearTimeout(Lhj1);
      let lhjSaveData1 = back.getrd(lhjSaveData1Offset[0], lhjSaveData1Offset[1])
      let lhjSaveData2 = back.getrd(lhjSaveData2Offset[0], lhjSaveData2Offset[1])
      let lhjStateData1 = monitorUtil.handleLhjData1(lhjSaveData1);
      let lhjStateData2 = monitorUtil.handleLhjData2(lhjSaveData2);
      let lhjStateData = _.merge(lhjStateData1, lhjStateData2);
      console.log("实时硫化机数据" + lhjSaveData1 + "," + lhjSaveData2)
      lhjStateData.isLine = lhjSaveData2 ? 1 : 0; //若硫化机状态为启动中
      lhjStateData.lhjState = lhjObjId;

      //硫化机通讯状态判断
      if (lhstatus != back.getrd(lhstatusOffset[0], lhstatusOffset[1])[0]) {
        lhstatushyy = true;
      } else {
        lhstatushyy = false;
      }
      lhstatus = back.getrd(lhstatusOffset[0], lhstatusOffset[1])[0];
      if (lhstatushyy) {
        // LhjStateService.findById(lhjObjId)
        //   .then(function(data) {
        //     LhjStateService.update(lhjObjId, {
        //       connectState: 1
        //     })
        //   })
          //当任务号完成硫化，删除任务号；当四个任务号全部完成，state为0
          if ((lhjSaveData2[8] == 1 || lhjSaveData2[8] == 2) && lhjSaveData2[8] != LHJ_FLAG_1) { //
            console.log("进入硫化机lhjSaveData2[8]的分支");
            LHJ_FLAG_1 = lhjSaveData2[8];
            delayUpdateLHJStateNProce(lhjSaveData2[8], lhjSaveData1, lhjObjId, 0, 8);
          }
          if ((lhjSaveData2[9] == 1 || lhjSaveData2[9] == 2) && lhjSaveData2[9] != LHJ_FLAG_2) {
            console.log("进入硫化机lhjSaveData2[9]的分支");
            LHJ_FLAG_2 = lhjSaveData2[9];
            delayUpdateLHJStateNProce(lhjSaveData2[9], lhjSaveData1, lhjObjId, 8, 16);
          }
          if ((lhjSaveData2[10] == 1 || lhjSaveData2[10] == 2) && lhjSaveData2[10] != LHJ_FLAG_3) {
            console.log("进入硫化机lhjSaveData2[10]的分支");
            LHJ_FLAG_3 = lhjSaveData2[10];
            delayUpdateLHJStateNProce(lhjSaveData2[10], lhjSaveData1, lhjObjId, 16, 24);
          }
          if ((lhjSaveData2[11] == 1 || lhjSaveData2[11] == 2) && lhjSaveData2[11] != LHJ_FLAG_4) {
            console.log("进入硫化机lhjSaveData2[11]的分支");
            LHJ_FLAG_4 = lhjSaveData2[11];
            delayUpdateLHJStateNProce(lhjSaveData2[11], lhjSaveData1, lhjObjId, 24, 32);
          }
      } else {
        // LhjStateService.findById(lhjObjId)
        //   .then(function(data) {
        //     LhjStateService.update(lhjObjId, {
        //       connectState: 0
        //     })
        //   })
      }
      // console.log("合拼后的硫化机数据：", lhjStateData2)
      LhjlastStateDataService.removeState().then(function() {
        LhjlastStateDataService.save(lhjStateData)
          .then(function() {
            Lhj1 = setTimeout(inter, IntervalTime5)
          })
          .catch(function(err) {
            log.error(err);
            Lhj1 = setTimeout(inter, IntervalTime5)
          });
      });
    }
  },
}

// 更新硫化机状态和工序状态
function delayUpdateLHJStateNProce(lhjSaveData, lhjSaveData1, lhjObjId, sliceStart, sliceEnd) {
  console.log('更新硫化机状态和工序状态, lhjSaveData标识是:', lhjSaveData);
  lhjSaveData = Number(lhjSaveData);
  let tId = String(monitorUtil.ascii2Str(_.slice(lhjSaveData1, sliceStart, sliceEnd))).trim();
  var __prodState = 2
  if (lhjSaveData == 2) __prodState = 3

      ProdProceService.updateByCondition({
        "tId": tId,
        "sType": 's1'
      }, {
        "$set": {
          "prodState": __prodState
        }
      }) //更新工序状态
     .then(function(res) {
        console.log("更新结果：", res)
      });

}

// 更新烘箱状态和工序状态
function delayUpdateHXStateNProce(data, tIds, hxObjId) {

  //更新工序状态
  tIds.forEach(_tId => {
    ProdProceService.find({
        tId: _tId.tId,
        sType: 's2'
      })
      .then(ProdProcedata => {
        if (!!ProdProcedata) {
          if (Array.isArray(ProdProcedata)) {
            for (let i = 0; i < ProdProcedata.length; i++) {
              // console.log('ProdProddata' + ProdProcedata[i])
              // let ProdProcedataStr = ProdProcedata[i] //这里真是奇怪
              let ProdProcedataStr = ProdProcedata[i]
              // 1的时候将硫化状态改为2
              let __prodState = 2;
              // 2的时候将硫化状态改为3，覆盖上面的2
              if (data == 2) __prodState = 3
              console.error('现在prodState状态是:', __prodState);
              ProdProceService.updateByCondition({
                  _id: ProdProcedataStr._id
                }, {
                  "$set": {
                    "prodState": __prodState
                  }
                })
                .then(function(res) {
                  console.log("更新结果：", res)
                })
            }
          } else {
            let __prodState = 2;
            // 2的时候将硫化状态改为3，覆盖上面的2
            if (data == 2) __prodState = 3
            console.error('现在prodState状态是:', __prodState);
            ProdProceService.updateByCondition({
              _id: ProdProcedata._id
            }, {
              "$set": {
                "prodState": __prodState
              }
            })
            .then(function(res) {
              console.log("更新结果：", res)
            })
          }
        };
      })
      .catch(function(e) {
        log.error(e);
      })
  });

  // 2的时候才更新烘箱状态.清空任务号
  if (data == 2) {
    HxStateService.update(hxObjId, {

      tIds: [],
      wd: [],
      sj: []
    });
  }

}
back.init();
