var express = require('express');
var router = express.Router();
var _ = require('lodash');

var ProdProdService = require('../services/prod_prod'); //产品
var ProdProceService = require('../services/prod_proce'); //工序
var HxStateService = require('../services/hx_state');
var HxStateDataService = require('../services/hx_state_data');
var HxStatelastDataService = require('../services/hx_state_lastdata');
var monitorUtil = require('../utils/monitorUtil');
var server = require('../routes/server');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/hxstates', function (req, res) {

    HxStateService.find()
        .then(function (list) {
            Promise.all(list.map(item => {
                // console.log(item._id)
                return HxStatelastDataService.findLastData({'hxState': item._id})
            })).then(data => {
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    // console.log(data[i][0], list[i]);
                    if (data[i][0]) {
                        delete data[i][0]._id;
                    }
                    newList.push(_.merge(data[i][0] ? data[i][0] : {}, list[i]));
                }
                res.json(newList);
            });
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

/**
 * 添加
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {               var body [description]
 * @return {[type]}      [description]
 */
router.post('/hxstate', function (req, res) {
    var body = req.body;

    var id = req.body._id;
    var userId = req.user._id;
    var tIds = body.tIds;
    //todo 判断tid的值是否相等
    var tId = tIds.length ? tIds[0].tId : 0;

    HxStateService.findById(id)
        .then(function (list) {

            // if (list && list.state == 0 && list.connectState == 1 && tId) {
                ProdProdService.findOne({tId: tId})
                    .then(function (prod) {
                        var data = {
                            wd: [],
                            sj: []
                        };

                        if (prod) {
                            var wp = _.find(prod.wp.toObject(), {sType: 's2'});

                            if (wp) {
                                wp.child.forEach(function (c, index) {
                                    if (index % 2 === 0) {
                                        data.wd.push(c.value);
                                    } else {
                                        data.sj.push(c.value);
                                    }
                                });
                            }
                        }
                        return data;
                    })
                    .then(function (data) {
                        // body.tIds = [];

                        return HxStateService.update(id, _.extend(body, data, {
                            adder: userId
                        }));
                    })
                    .then(function () {
                        let oldIds = list.tIds,
                            commonIds = [],
                            exceptTIds = [],
                            newTIds = [];
                        commonIds = _.intersectionBy(tIds, oldIds, 'tId'); //返回共有元素的数组，e.g:_.intersection([1, 2], [4, 2], [2, 1]);  => [2]
                        exceptTIds = _.differenceBy(oldIds, commonIds, 'tId');
                        newTIds = _.differenceBy(tIds, commonIds, 'tId');
                        console.log('commonIds-->>',commonIds);
                        console.log('exceptTIds-->>',exceptTIds);
                        console.log('newTIds-->>',newTIds);
                        //更新工序状态
                        //1.解绑
                        if (exceptTIds.length > 0) {
                            Promise.all(_.map(exceptTIds, item=> {
                                    return ProdProceService.find({tId: item.tId, sType: 's2'})
                                }))
                                .then(ProdProcedata => {
                                    for (let i = 0; i < ProdProcedata.length; i++) {
                                        let ProdProcedataStr = ProdProcedata[i][0]
                                        if (ProdProcedataStr.prodState == 1) {
                                            ProdProcedataStr.prodState = 0
                                            ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                        }
                                    }
                                })
                                .catch(function (e) {
                                    log.error(e);
                                    res.status(500).json(e);
                                });
                        }

                        //2.新绑定
                        if (newTIds.length > 0) {
                            Promise.all(_.map(newTIds, item=> {
                                    return ProdProceService.find({tId: item.tId, sType: 's2'})
                                }))
                                .then(ProdProcedata => {
                                    for (let i = 0; i < ProdProcedata.length; i++) {
                                        //console.log('ProdProddata' + ProdProcedata[i])
                                        let ProdProcedataStr = ProdProcedata[i][0]
                                        if (ProdProcedataStr.prodState == 0) {
                                            ProdProcedataStr.prodState = 1
                                            ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                            console.log('更新计划状态')
                                        }
                                    }
                                    res.json({code: 200, msg: '添加成功'});

                                })
                                .catch(function (e) {
                                    log.error(e);
                                    res.status(500).json(e);
                                });
                        } else {
                            res.json({code: 200, msg: '添加成功'});
                        }

                    })
                    .catch(function (err) {
                        log.error(err);
                        res.status(500).json(err);
                    });
            // }
        });
});

/**
 * 查询完整状态二段硫化的任务号
 */
router.get('/hxstates/tasks', function (req, res) {
    ProdProceService.find()
        .then(function (list) {
            let newList = [];
            _.forEach(_.groupBy(_.sortBy(list, 'index'), 'tId'), function (item, key) {

                let s1Index = -1,s2Index = -1;
                _.forEach(item, function (childItem, childIndex) {
                    // 二段硫化标识为0（未绑定）
                    if (childItem.sType == 's2' && childItem.prodState == 0) {
                    // if (childItem.sType == 's2' && childItem.state == 0) {
                        s2Index = childIndex;
                        // if (Array.isArray(item) && item.length > 0) {
                        //     newList.push({tId: item[0].tId, selected: item[0].selected});
                        //     console.log('任务号列表：', newList);
                        // }
                    }
                    // 一段硫化标识3（硫化完成）
                    if (childItem.sType == 's1' && childItem.prodState > 2) {
                        s1Index = childIndex;
                    }
                })

                // 一段硫化硫化完成,二段硫化未绑定情况下能添加
                if (s2Index !== -1 && s1Index !== -1) {
                    // if (Array.isArray(item) && item.length > 0) {
                        newList.push({tId: key, selected: 0});
                    // }
                }
            });
            newList = _.uniqBy(newList, 'tId');
            res.json(newList);
        });

});

/**
 * 修改
 */
router.put('/hxstate/:id', function (req, res) {
    var body = req.body;
    delete  body._id;

    var id = req.params.id;
    var userId = req.user._id;
    var tIds = body.tIds;
    //todo 判断tid的值是否相等
    var tId = tIds.length ? tIds[0].tId : 0;

    HxStateService.findById(id)
        .then(function (list) {

            // if (list && list.state == 0 && list.connectState == 1) {

                ProdProdService.findOne({tId: tId})
                    .then(function (prod) {
                        var data = {
                            wd: [],
                            sj: []
                        };

                        if (prod) {
                            var wp = _.find(prod.wp.toObject(), {sType: 's2'});

                            if (wp) {
                                wp.child.forEach(function (c, index) {
                                    if (index % 2 === 0) {
                                        data.wd.push(c.value);
                                    } else {
                                        data.sj.push(c.value);
                                    }
                                });
                            }
                        }
                        return data;
                    })
                    .then(function (data) {
                        // body.tIds = [];

                        return HxStateService.update(id, _.extend(body, data, {
                            adder: userId
                        }));
                    })
                    .then(function () {
                        let oldIds = list.tIds,
                            commonIds = [],
                            exceptTIds = [],
                            newTIds = [];
                        commonIds = _.intersectionBy(tIds, oldIds, 'tId'); //返回共有元素的数组，e.g:_.intersection([1, 2], [4, 2], [2, 1]);  => [2]
                        exceptTIds = _.differenceBy(oldIds, commonIds, 'tId');
                        newTIds = _.differenceBy(tIds, commonIds, 'tId');
                        console.log('commonIds-->>',commonIds);
                        console.log('exceptTIds-->>',exceptTIds);
                        console.log('newTIds-->>',newTIds);
                        //更新工序状态
                        //1.解绑
                        if (exceptTIds.length > 0) {
                            Promise.all(_.map(exceptTIds, item=> {
                                    return ProdProceService.find({tId: item.tId, sType: 's2'})
                                }))
                                .then(ProdProcedata => {
                                    for (let i = 0; i < ProdProcedata.length; i++) {
                                        let ProdProcedataStr = ProdProcedata[i][0]
                                        if (ProdProcedataStr.prodState == 1) {
                                            ProdProcedataStr.prodState = 0
                                            ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                        }
                                    }
                                })
                                .catch(function (e) {
                                    log.error(e);
                                    res.status(500).json(e);
                                });
                        }

                        //2.新绑定
                        if (newTIds.length > 0) {
                            Promise.all(_.map(newTIds, item=> {
                                    return ProdProceService.find({tId: item.tId, sType: 's2'})
                                }))
                                .then(ProdProcedata => {
                                    for (let i = 0; i < ProdProcedata.length; i++) {
                                        //console.log('ProdProddata' + ProdProcedata[i])
                                        let ProdProcedataStr = ProdProcedata[i][0]
                                        if (ProdProcedataStr.prodState == 0) {
                                            ProdProcedataStr.prodState = 1
                                            ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                            console.log('更新计划状态')
                                        }
                                    }
                                    res.json({code: 200, msg: '修改成功'});

                                })
                                .catch(function (e) {
                                    log.error(e);
                                    res.status(500).json(e);
                                });
                        } else {
                            res.json({code: 200, msg: '修改成功'});
                        }

                    })
                    .catch(function (err) {
                        log.error(err);
                        res.status(500).json(err);
                    });
            // } else {
            //     res.status(200).json({code: 1000, msg: '通讯状态或硫化状态未满足写入状态'});
            // }
        });
});

/**
 * 删除
 */
router.delete('/hxstate/:id', function (req, res) {
    var id = req.params.id;

    HxStateService.remove(id)
        .then(function () {
            res.end();
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

/**
 * 写入数据
 */
router.put('/hxstates/write', function (req, res) {
    let body = req.body;
    let id = body._id;
    delete  body._id;
    let tIds = body.tIds;
    //处理任务号
    let tIdCharArr = [];
    for (let i = 0; i < tIds.length; i++) {
       tIdCharArr = tIdCharArr.concat(monitorUtil.str2Ascii(tIds[i].tId))
    }

    //查询二段硫化的数据
    HxStateService.update({_id: id}, { sj: body.sj, wd: body.wd})
    .then(function() {

    HxStateService.findById(id)
        .then(function (data)
        {
            let sjArr = data.sj; //时间数组
            let wdArr = data.wd; //温度数组
            // 在数组长度没有达到30情况下，在原数组上继续填充0让长度达到30
            sjArr = monitorUtil.zeroFill(sjArr, 30)
            wdArr = monitorUtil.zeroFill(wdArr, 30)

            console.error("时间数组------->>", sjArr);
            console.error("温度数组------->>", wdArr);

            let hxData = [];
            hxData[0] = 1;
            hxData = hxData.concat(sjArr, wdArr) //要写入到mod的数据数据
            hxData[61] = req.user.wuId;//操作员工号
            data.eqIp='127.0.0.1';

            console.error("要写入到mod的数据数据------->>", hxData);
            
            //写入数据
            let IntervalTime2 = 1 * 10
            // var newArr2=new Array(tIdCharArr)
            let hx1 = '';
            inter();

            function inter() {
                clearTimeout(hx1);

                server.setwd(data.writeStart+100, tIdCharArr)
                server.setwd(data.writeStart, hxData)
                // hx1 = setTimeout(inter, IntervalTime2)
                HxStateService.update(id, {state: 1, picker: req.user._id})
                //更新工序状态
                Promise.all(_.map(tIds, item=> {
                    // console.log('item'+item)
                    return ProdProceService.find({tId: item.tId, sType: 's2'})
                }))
                    .then(ProdProcedata => {

                    // console.log('ProdProcedata'+ProdProcedata)
                        for (let i = 0; i < ProdProcedata.length; i++) {
                            if (ProdProcedata[i][0]) {
                                // console.log('ProdProddata--->>' + ProdProcedata[i])
                                let ProdProcedataStr = ProdProcedata[i][0] //这里真是奇怪
                                if (ProdProcedataStr.prodState == 1) {
                                    ProdProcedataStr.prodState = 2
                                    ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                                    // console.log('更新计划状态')
                                }
                            }
                        }
                        res.json({code: 200, msg: '写入成功'});
                    })
                    .catch(function (e) {
                        log.error(e);
                        res.status(500).json(e);
                    });


                // hxMd.write(data.writeTIdStart, newArr2)  //写入任务号
                //     .then(function(){
                //       hxMd.write(data.writeStart, hxData)  //写入硫化数据
                //       .then(function (d) {
                //           log.info("Write hxData to registers", d);
                //           HxStateService.update(id, {state: 1, picker: req.user._id})
                //           //更新工序状态
                //           Promise.all(_.map(tIds, item=> {
                //                   //console.log('item'+item)
                //                   return ProdProceService.find({tId: item, sType: 's2'})
                //               }))
                //               .then(ProdProcedata => {
                //                   for (let i = 0; i < ProdProcedata.length; i++) {
                //                       // console.log('ProdProddata' + ProdProcedata[i])
                //                       let ProdProcedataStr = ProdProcedata[i][0] //这里真是奇怪
                //                       if (ProdProcedataStr.prodState == 1) {
                //                           ProdProcedataStr.prodState = 2
                //                           ProdProceService.update(ProdProcedataStr._id, ProdProcedataStr)
                //                           // console.log('更新计划状态')
                //                       }
                //                   }
                //                   res.json({code: 200, msg: '写入成功'});
                //               })
                //               .catch(function (e) {
                //                   log.error(e);
                //                   res.status(500).json(e);
                //               });
                //       })
                //
                //     })
                //     .catch(function (e) {
                //         //hxMd.connect();
                //         hx1 = setTimeout(inter, IntervalTime2)
                //         log.error('write hx' + JSON.parse(e));
                //         //res.status(500).json({msg: e.message});
                //     })

            }


        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
    });

});

module.exports = router;
