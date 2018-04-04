var Promise = require('bluebird');
var _ = require('lodash');
var log = require('../utils/log4js').default();

var HxStateDataService = require('../services/hx_state_data');
var HxStateService = require('../services/hx_state');
var LhjStateDataService = require('../services/pblhj_state_data');
var LhjStateService = require('../services/pblhj_state');
var WsdDataService = require('../services/wsd_data');
var WsdStateService = require('../services/wsd_state');
var ProdProceService = require('../services/prod_proce'); //工序

var monitorUtil = require('../utils/monitorUtil')
var Modbus = require('../utils/ModBus.js')


var IntervalTime1 = 60 * 1000;
var IntervalTime2 = 5 * 1000;

/*烘箱*/
function hxCallBack() {
    // let option = {
    //     ip: '10.58.8.43',
    //     id: 1,
    //     port: 8502
    // }
    let option = {
        ip: '127.0.0.1',
        id: 1,
        port: 8502
    }
    let hxMd = new Modbus(option);
    hxMd.connect();
    let hx1 = '';
    inter();
    function inter() {
        clearTimeout(hx1);
        hxMd.read(49, 60).then(function (d) {
            console.log(option.ip + ' recive:' + d.data)
            //先查询再更改hxState通讯状态改为1

            let hxReadData = d.data;

            HxStateService.find().then(function (models) {
                for (let i = 0; i < models.length; i++) {
                    //存储数据
                    let hxData = models[i];
                    let hxObjId = hxData._id;
                    let data = hxReadData.slice(i * 20, (i * 20) + hxData.readLength);
                    let hxStateData = monitorUtil.handleHxData(data)
                    let isOpen = (data[7] == 1);//若烘箱状态为启动中
                    hxStateData.isLine = isOpen ? 1 : 0;
                    hxStateData.hxState = hxObjId;

                    HxStateDataService.save(hxStateData)
                        .then(function () {
                            let tIds = hxData.tIds;
                            if (hxData.connectState != 1) {
                                HxStateService.update(hxObjId, {connectState: 1})
                            }
                            if (data[12] == 100 || data[12] == 0) {
                                // 先查询，后改变仪表状态为0空闲中，清空任务号和温度时间
                                if (hxData.state != 0) {
                                    HxStateService.update(hxObjId, {state: 0, tIds: [], wd: [], sj: []});
                                    //更新工序状态
                                    Promise.all(_.map(tIds, item => {
                                        //console.log('item'+item)
                                        return ProdProceService.find({tId: item, sType: 's2'})
                                    }))
                                .then(ProdProcedata => {
                                        for (let i = 0; i < ProdProcedata.length; i++) {
                                        // console.log('ProdProddata' + ProdProcedata[i])
                                        let ProdProcedataStr = ProdProcedata[i][0] //这里真是奇怪
                                        if (ProdProcedataStr.prodState == 2) {
                                            ProdProcedataStr.prodState = 3
                                            ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                            console.log('更新计划状态')
                                        }
                                    }
                                })
                                .catch(function (e) {
                                        log.error(e);
                                    });
                                }
                                // 先查询相应任务号的硫化工序状态是否为3，若不为3则修改为3
                                //遍历任务号
                                //wp数据结构不满足现有需求
                                //ProdProdService.updateMany({tId:{$in:tIds},wp:{$elemMatch: {state:{$ne:3},sType:'s2'}}},{$set: { "wp.$.state": 3 }})
                                //    .then(function(data){
                                //
                                //    })
                            }

                        })
                        .catch(function (err) {
                            log.error(err);
                        });
                }
            });


        })
            .then(function () {
                hx1 = setTimeout(inter, IntervalTime2)
            })
            .catch(function (e) {
                // 先查询再更改hxState通讯状态改为0
                console.log('read hx' + e)
                if(e.errno!='Timed out'){
                    if (!hxMd.isOpen()) {
                        hxMd.connect();
                    }
                    hx1 = setTimeout(inter, IntervalTime2)
                    HxStateService.find().then(function (models) {
                        for (let i = 0; i < models.length; i++) {
                            //hxCallBack(models[i])
                            //存储数据
                            let hxObjId = models[i]._id;
                            HxStateService.findById(hxObjId)
                                .then(function (data) {
                                    //console.log('run')
                                    if (data.connectState != 0) {
                                        HxStateService.update(hxObjId, {connectState: 0})
                                    }
                                })
                        }
                    });
                }
            })
    }
}

//烘箱实时读取设备
hxCallBack();

/*硫化机*/
function lhjCallBack(lhj) {
    let option = {
        ip: lhj.eqIp,
        id: lhj.eqId,
        port: lhj.eqPort
    }, lhjObjId = lhj._id;
    let lhjMd1 = new Modbus(option)//最大长度127,实际是126
    lhjMd1.connect();
    let lhj1 = '';
    inter();
    function inter() {
        clearTimeout(lhj1);
        let lhjSaveData1={}
        lhjMd1.read(lhj.readStart,124).
        then(function(data1) {
            console.log(lhj.eqId + ' recive1:' + data1.data);
            lhjSaveData1=data1.data;
            return lhjMd1.read(lhj.readStart+124,lhj.readLength-124)
        })
            .then(function(data2) {
                let lhjSaveData2 =data2.data
                console.log(lhj.eqId + ' recive2:' + JSON.stringify(data2.data));
                //存储数据
                let lhjStateData1 = monitorUtil.handleLhjData1(lhjSaveData1);
                let lhjStateData2 = monitorUtil.handleLhjData2(lhjSaveData2);
                let lhjStateData = _.merge(lhjStateData1, lhjStateData2);
                lhjStateData.isLine = lhjSaveData2 ? 1 : 0;//若硫化机状态为启动中
                lhjStateData.lhjState = lhjObjId;

                LhjStateDataService.save(lhjStateData)
                    .then(function () {
                        //先查询再更改hxState通讯状态改为1
                        LhjStateService.findById(lhjObjId)
                            .then(function (newLhjObj) {
                                let tIds = newLhjObj.tIds;
                                if (newLhjObj.connectState != 1) {
                                    LhjStateService.update(lhjObjId, {connectState: 1})
                                }
                                //当任务号完成硫化，删除任务号；当四个任务号全部完成，state为0
                                if (lhjSaveData2[8] == 1) {
                                    let tId = monitorUtil.ascii2Str(_.slice(lhjSaveData1, 0, 8));
                                    if (tIds.indexOf(tId) != -1) {
                                        LhjStateService.update(lhjObjId, {tIds: _.without(tIds, tId)}) //更新LhjState状态
                                        ProdProceService.find({tId: tId, sType: 's1'})  //更新工序状态
                                            .then(function (ProdProceData) {
                                                if (ProdProceData.prodState == 2) {
                                                    ProdProceData.prodState = 3
                                                    ProdProceService.update(ProdProceData._id, ProdProceData)
                                                }
                                            })
                                    }
                                }
                                if (lhjSaveData2[9] == 1) {
                                    let tId = monitorUtil.ascii2Str(_.slice(lhjSaveData1, 8, 16));
                                    if (tIds.indexOf(tId) != -1) {
                                        LhjStateService.update(lhjObjId, {tIds: _.without(tIds, tId)})
                                        ProdProceService.find({tId: tId, sType: 's1'})  //更新工序状态
                                            .then(function (ProdProceData) {
                                                if (ProdProceData.prodState == 2) {
                                                    ProdProceData.prodState = 3
                                                    ProdProceService.update(ProdProceData._id, ProdProceData)
                                                }
                                            })
                                    }
                                }
                                if (lhjSaveData2[10] == 1) {
                                    let tId = monitorUtil.ascii2Str(_.slice(lhjSaveData1, 16, 24));
                                    if (tIds.indexOf(tId) != -1) {
                                        LhjStateService.update(lhjObjId, {tIds: _.without(tIds, tId)})
                                        ProdProceService.find({tId: tId, sType: 's1'})  //更新工序状态
                                            .then(function (ProdProceData) {
                                                if (ProdProceData.prodState == 2) {
                                                    ProdProceData.prodState = 3
                                                    ProdProceService.update(ProdProceData._id, ProdProceData)
                                                }
                                            })
                                    }
                                }
                                if (lhjSaveData2[11] == 1) {
                                    let tId = monitorUtil.ascii2Str(_.slice(lhjSaveData1, 24, 32));
                                    if (tIds.indexOf(tId) != -1) {
                                        LhjStateService.update(lhjObjId, {tIds: _.without(tIds, tId)})
                                        ProdProceService.find({tId: tId, sType: 's1'})  //更新工序状态
                                            .then(function (ProdProceData) {
                                                if (ProdProceData.prodState == 2) {
                                                    ProdProceData.prodState = 3
                                                    ProdProceService.update(ProdProceData._id, ProdProceData)
                                                }
                                            })
                                    }
                                }
                                if (lhjSaveData2[8] == 1 && lhjSaveData2[9] == 1 && lhjSaveData2[10] == 1 && lhjSaveData2[11] == 1) {
                                    if (newLhjObj.state != 0) {
                                        LhjStateService.update(lhjObjId, {state: 0})
                                    }
                                }
                            })

                    })
                    .catch(function (err) {
                        log.error(err);
                    });
            })
            .then(function () {
                lhj1 = setTimeout(inter, IntervalTime2)
            })
            .catch(function (e) {
                // 先查询再更改hxState通讯状态改为0
                console.log('read lhj' + e);
                if(e.errno!='Timed out') {
                    if (!lhjMd1.isOpen()) {
                        lhjMd1.connect();

                    }
                    lhj1 = setTimeout(inter, IntervalTime2)
                    LhjStateService.findById(lhjObjId)
                        .then(function (data) {
                            if (data.connectState != 0) {
                                LhjStateService.update(lhjObjId, {connectState: 0})
                            }
                        })
                }
            })
    }
}

// LhjStateService.find().then(function (models) {
//     for (let i = 0; i < models.length; i++) {
//         lhjCallBack(models[i])
//     }
// });

/*温湿度*/
function wsdCallBack(wsd) {
    let option = {
        ip: wsd.eqIp,
        id: wsd.eqId,
        port: wsd.eqPort
    }, wsdObjId = wsd._id;
    let wsdMd = new Modbus(option);
    wsdMd.connect();
    let wsdInterval = '';
    inter();
    function inter() {
        clearTimeout(wsdInterval);
        wsdMd.read(wsd.readStart, wsd.readLength).then(function (d) {
            console.log('温湿度 recive:' + d.data)

            let data = d.data;
            //存储数据
            let wsdStateData = monitorUtil.handleWsdData(data, wsd.eqIp)
            WsdDataService.save(wsdStateData)
                .then(function () {
                    WsdStateService.findById(wsdObjId)
                        .then(function (data) {
                            if (data.connectState != 1) {
                                WsdStateService.update(wsdObjId, {connectState: 1})
                            }
                        })
                    wsdInterval = setTimeout(inter, IntervalTime1)
                })
                .catch(function (err) {
                    log.error(err);
                });
        })
            .catch(function (e) {
                console.log('read wsd' + e)
                if(e.errno!='Timed out') {
                    if (!wsdMd.isOpen()) {
                        wsdMd.connect();
                    }
                    wsdInterval = setTimeout(inter, IntervalTime1)

                    WsdStateService.findById(wsdObjId)
                        .then(function (data) {
                            if (data.connectState != 0) {
                                WsdStateService.update(wsdObjId, {connectState: 0})
                            }
                        })
                }
            })
    }
}
WsdStateService.find().then(function (models) {
    for (let i = 0; i < models.length; i++) {
        //wsdCallBack(models[i])
    }
});

