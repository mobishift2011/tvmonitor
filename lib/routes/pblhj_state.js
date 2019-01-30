var express = require('express');
var router = express.Router();
var _ = require('lodash');

var prodProdService = require('../services/prod_prod');
var ProdProceService = require('../services/prod_proce'); //工序
var pblhjStateService = require('../services/pblhj_state');
var pblhjStateDataService = require('../services/pblhj_state_data');
var pblhjStatelastDataService = require('../services/pblhj_state_lastdata');

var monitorUtil = require('../utils/monitorUtil');
var Modbus = require('../utils/ModBus.js')
var server = require('../routes/server');
var log = require('../utils/log4js').default();
var logger = require('../utils/log4js').socketio();
let IntervalTime2 = 10 * 1000;
let socketServer=require('../../socket_server.js');
/**
 * 查询
 */
router.get('/pblhjstates', function (req, res) {
    
    pblhjStateService.find()
        .then(function (list) {
            Promise.all(list.map(item => {
                return pblhjStatelastDataService.findLastData({lhjState: item._id})
            })).then(data => {
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    if (data[i][0]) {
                        delete data[i][0]._id;
                    }
                    var lhyl =list[i].lhyl;
                    newList.push(_.merge(list[i],data[i][0] ? data[i][0] : {} ));
                    newList[i].lhyl=lhyl;
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
 * 查询
 */
router.get('/pblhjstateBytId/:id', function (req, res) {
    var tid = req.params.id;

    pblhjStateService.find()
        .then(function (list) {
            if (list.length > 0) {
                var currentUserTId = [];
                list.forEach(function(p){
                    if (p.tIds.length > 0 && p.tIds[0] === tid) {
                        currentUserTId.push(p);         
                    }
                })
                return currentUserTId;
            } 
        })
        .then(function (list) {
            Promise.all(list.map(item => {
                return pblhjStatelastDataService.findLastData({lhjState: item._id})
            })).then(data => {
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    if (data[i][0]) {
                        delete data[i][0]._id;
                    }
                    var lhyl =list[i].lhyl;
                    newList.push(_.merge(list[i],data[i][0] ? data[i][0] : {} ));
                    newList[i].lhyl=lhyl;
                }
                res.json(newList);
            });
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


router.get('/pblhjstate/:id', function (req, res) {
    var id = req.params.id;
    pblhjStateService.find({eqId: id})
        .then(function (list) {
          Promise.all(list.map(item => {
                return pblhjStatelastDataService.findLastData({lhjState: item._id})
            })).then(data => {
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    if (data[i][0]) {
                        delete data[i][0]._id;
                    }
                    var lhyl =list[i].lhyl;
                    newList.push(_.merge(list[i],data[i][0] ? data[i][0] : {} ));
                    newList[i].lhyl=lhyl;
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
 * 查询完整状态一段硫化的任务号
 */
/*router.get('/pblhjstates/tasks', function (req, res) {
    ProdProceService.find()
        .then(function (list) {
            let newList = [];

            _.forEach(_.groupBy(_.sortBy(list, 'index'), 'tId'), function (item, index) {
                let s2Index = -1,s1Index = -1;
                _.forEach(item, function (childItem, childIndex) {
                    // if (childItem.sType == 's2' && childItem.prodState == 3) {
                    //     s2Index = childIndex;
                    // }
                    if (childItem.sType == 's1' && childItem.prodState == 0) {
                        s1Index = childIndex;
                    }   
                })
                // if (s2Index<s1Index) {
                if (s1Index !== -1) {
                    newList.push(index);
                }
            });

            if(req.params.tId){
                let hasSelect=_.find(list,{tId:req.params.tId,sType:"s1"}).wpc
                _.filter(newList,function (item) {
                    return monitorUtil.deepCompare(item,hasSelect);
                })   
            }

            newList = _.uniq(newList) || [];
            res.json(newList);
        });
});
*/
router.get('/pblhjstates/tasks', function (req, res) {

    ProdProceService.find({sType: 's1', prodState: 0, worker: req.query.user})
        .then(function (list) {
            if (req.query.tId) 
                return list.filter(li => li.tId === req.query.tId);
            else return list;
        })
        .then(function (list) {

            let newList = [];

            list.forEach(li => {
                newList.push(li.tId);
            });
            // if(req.params.tId){
            //     let hasSelect=_.find(list,{tId:req.params.tId,sType:"s1"}).wpc
            //     _.filter(newList,function (item) {
            //         return monitorUtil.deepCompare(item,hasSelect);
            //     })   
            // }

            newList = _.uniq(newList) || [];
            res.json(newList);
        });
});



/**
 * 新增
 */
router.post('/pblhjstate', function (req, res) {
    var body = req.body;
    var userId = req.user._id;

    var tId = body.tIds.filter(function (item) {
        return !!item;
    })[0];

    pblhjStateService.find({eqId: body.eqId})
        .then(function (list) {
            if (list.length) {
                res.status(409).end();
            } else {
                prodProdService.findOne({tId: tId})
                    .then(function (prod) {
                        if (prod) {
                            var wp = _.find(prod.wp.toObject(), {sType: 's1'});

                            if (wp) {
                                return {
                                    pqyl: wp.child[0].value,
                                    pqcs: wp.child[1].value,
                                    swsj: wp.child[2].value,
                                    swbcz: wp.child[3].value,
                                    swjxz: wp.child[4].value,
                                    lhsj: wp.child[5].value,
                                    lhyl: wp.child[6].value,
                                    lhylcz: wp.child[7].value,
                                    lhwd: wp.child[8].value,
                                    lhwdzdz: wp.child[9].value,
                                    lhwdzxz: wp.child[10].value
                                };
                            } else {
                                return {};
                            }


                        } else {
                            return {};
                        }
                    })
                    .then(function (data) {
                        return pblhjStateService.save(_.extend(body, data, {adder: userId}));

                    })
                    .then(function (data) {
                        res.json(data);
                    })
                    .catch(function (err) {
                        log.error(err);
                        res.status(500).json(err);
                    });
            }
        });

});

/**
 * 修改
 */
router.put('/pblhjstate/:id', function (req, res) {
    var body = req.body;
    delete  body._id;

    var id = req.body.lhjState;
    var userId = req.user._id;

    var tIds = body.tIds
    // .filter(function (item) {
    //     return !!item;
    // });

    var tId = tIds.length ? tIds[0] : 0;
        pblhjStateService.findById(id)
        .then(function (list) {
            if (list && list.state == 0 && list.connectState == 1) {
                prodProdService.findOne({tId: tId})
                    .then(function (prod) {
                        var wp;
                        if (prod) {
                            wp = _.find(prod.wp.toObject(), {sType: 's1'});
                        }

                        if (wp) {
                            return {
                                pqyl: wp.child[0].value,
                                pqcs: wp.child[1].value,
                                swsj: wp.child[2].value,
                                swbcz: wp.child[3].value,
                                swjxz: wp.child[4].value,
                                lhsj: wp.child[5].value,
                                lhyl: wp.child[6].value,
                                lhylcz: wp.child[7].value,
                                lhwd: wp.child[8].value,
                                lhwdzdz: wp.child[9].value,
                                lhwdzxz: wp.child[10].value
                            };
                        } else {
                            return {
                                pqyl: null,
                                pqcs: null,
                                swsj: null,
                                swbcz: null,
                                swjxz: null,
                                lhsj: null,
                                lhyl: null,
                                lhylcz: null,
                                lhwd: null,
                                lhwdzdz: null,
                                lhwdzxz: null
                            };
                        }
                    })
                    .then(function (data) {
                        return pblhjStateService.update(id, _.extend(body, data, {
                            adder: userId
                        }));
                    })
                    .then(function (data) {
                        let oldIds = list.tIds,
                            commonIds = [],
                            exceptTIds = [],
                            newTIds = [];
                        commonIds = _.intersection(tIds, oldIds);
                        exceptTIds = _.difference(oldIds, commonIds);
                        newTIds = _.difference(tIds, commonIds);
                        //更新工序状态
                        //1.解绑

                        //console.log(exceptTIds);

                        if (exceptTIds.length > 0) {
                            Promise.all(_.map(exceptTIds, item=> {
                                    return ProdProceService.find({tId: item, sType: 's1'})
                                }))
                                .then(ProdProceData => {
                                    for (let i = 0; i < ProdProceData.length; i++) {
                                        let ProdProceDataStr = ProdProceData[i][0]
                                        if (ProdProceDataStr && ProdProceDataStr.prodState == 1) {
                                            ProdProceDataStr.prodState = 0
                                            ProdProceService.update(ProdProceDataStr._id, ProdProceDataStr)
                                        }
                                    }
                                })
                                .catch(function (e) {
                                    log.error(e);
                                    //res.status(500).json(e);
                                });
                        }

                        //console.log(newTIds);

                        //2.新绑定
                        if (newTIds.length > 0) {
                            Promise.all(_.map(newTIds, item=> {
                                    return ProdProceService.find({tId: item, sType: 's1'})
                                }))
                                .then(ProdProceData => {
                                    for (let i = 0; i < ProdProceData.length; i++) {
                                        let ProdProceDataStr = ProdProceData[i][0]
                                        if(ProdProceDataStr) {
                                            if (ProdProceDataStr.prodState == 0) {
                                                ProdProceDataStr.prodState = 1
                                                ProdProceService.update(ProdProceDataStr._id, ProdProceDataStr)
                                            }
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
            } else {
                var resData = {code: 201, msg: '当前状态不允许绑定'};
                res.json(resData);
            }

        });
});

/**
 * 删除
 */
router.delete('/pblhjstate/:id', function (req, res) {
    let id = req.params.id;
    pblhjStateService.remove(id)
        .then(function () {
            res.end();
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


router.put('/pblhjstates/write', function (req, res) {
    let body = req.body;
    // logger.info(body)

    let id = body._id;
    delete  body._id;
    let tIds = body.tIds;
    let writeInfoList = body.writeInfoList;
    let pblhj_obj = {};
    //处理任务号
    pblhj_obj.pqyl = body.pqyl;
    pblhj_obj.pqcs = body.pqcs;
    pblhj_obj.swsj = body.swsj;
    pblhj_obj.swbcz = body.swbcz;
    pblhj_obj.swjxz = body.swjxz;
    pblhj_obj.lhyl = body.lhyl;
    pblhj_obj.lhylcz = body.lhylcz;
    pblhj_obj.lhsj = body.lhsj;
    pblhj_obj.lhwd = body.lhwd;
    pblhj_obj.lhwdzdz = body.lhwdzdz;
    pblhj_obj.lhwdzxz = body.lhwdzxz;

    pblhj_obj.firstTask =body.firstTask
    pblhj_obj.secondTask =body.secondTask
    pblhj_obj.thirdTask =body.thirdTask
    pblhj_obj.fourthTask =body.fourthTask
    //添加模具号
    pblhj_obj.firstTask.mjh = writeInfoList[0] && writeInfoList[0].mould.mId
    pblhj_obj.secondTask.mjh = writeInfoList[1] && writeInfoList[1].mould.mId
    pblhj_obj.thirdTask.mjh = writeInfoList[2] && writeInfoList[2].mould.mId
    pblhj_obj.fourthTask.mjh = writeInfoList[3] && writeInfoList[3].mould.mId
    //补全任务号
    pblhj_obj.firstTask.tId = tIds[0]
    pblhj_obj.secondTask.tId = tIds[1]
    pblhj_obj.thirdTask.tId = tIds[2]
    pblhj_obj.fourthTask.tId = tIds[3]
    //补全 材料牌号
    pblhj_obj.firstTask.cpth =writeInfoList[0] && writeInfoList[0].cId
    pblhj_obj.secondTask.cpth =writeInfoList[1] && writeInfoList[1].cId
    pblhj_obj.thirdTask.cpth =writeInfoList[2] && writeInfoList[2].cId
    pblhj_obj.fourthTask.cpth =writeInfoList[3] && writeInfoList[3].cId


    //保存到数据库
    pblhjStateService.update({_id: req.body.lhjState}, pblhj_obj)
    .then(function () {
        res.json({code: 200, msg: '成功保存'});
    })
    .catch(function (err) {
        res.status(500).json(err);
    })


    //查询一段硫化的数据
    // pblhjStateService.update({_id: req.body.lhjState}, pblhj_obj)
    // .then(function() {
    //     pblhjStateService.findById(req.body.lhjState)
    //         .then(function (data) {
    //             let lhjData = [];//要写入到mod的数据数据
    //             lhjData[0] = data.pqyl;
    //             lhjData[1] = data.pqcs;
    //             lhjData[2] = data.swsj;
    //             lhjData[3] = data.lhyl;
    //             lhjData[4] = data.lhylcz;
    //             lhjData[5] = data.lhsj;
    //             lhjData[6] = data.lhwd;
    //             lhjData[7] = data.lhwdzdz;
    //             lhjData[8] = data.lhwdzxz;

    //             let tIdDatas=monitorUtil.handleLhjWriteData(data);
    //             lhjData.concat(tIdDatas);

    //             var wuId = Number(req.user.wuId);
    //             if (wuId > 30000) wuId = 30000;
    //             lhjData[115] = req.user.wuId;//操作员工号

    //             //写入数据
    //             // let option = {
    //             //     ip: data.eqIp,
    //             //     id: data.eqId,
    //             //     port: data.eqPort
    //             // }
    //             // let lhjMd = new Modbus(option);
    //             // lhjMd.connect();
    //             let lhj1 = '';
    //             inter();
    //             inter2();

    //             function inter() {
    //                 clearTimeout(lhj1);
    //                 console.log("写入硫化机地址2000:"+lhjData)
    //                 server.setwd(2000, lhjData);
    //                 // var userId="590e989039054d1b5caf570c"

    //                 // prodProdService.find({skiller: userId})
    //                     // .then(function (list) {
    //                         //得到多个任务号
                        
    //                        var obj = {tId: " ", mould: {mId:" ",ccNum:" "}, cId: " "};
    //                        for(var i=0;i<writeInfoList.length;i++){
    //                             var tIdData = '';
    //                             if (writeInfoList[i] === 0) {
    //                                tIdData = monitorUtil.handleLhjWriteData2(obj);
    //                                console.log("写入任务号"+tIdData[0])
    //                                server.setwd(2015+i*8, tIdData[0]);
    //                                console.log("写入模具号"+tIdData[1])
    //                                server.setwd(2047+i*8, tIdData[1]);
    //                                console.log("写入产品图号"+tIdData[2])
    //                                server.setwd(2079+i*8, tIdData[2]);
    //                                console.log("写入有效模腔数"+tIdData[3])
    //                                server.setwd(2111+i, tIdData[3]);
    //                             } else {
    //                                tIdData = monitorUtil.handleLhjWriteData2(writeInfoList[i]);
    //                                console.log("写入任务号"+tIdData[0])
    //                                server.setwd(2015+i*8, tIdData[0]);
    //                                console.log("写入模具号"+tIdData[1])
    //                                server.setwd(2047+i*8, tIdData[1]);
    //                                console.log("写入产品图号"+tIdData[2])
    //                                server.setwd(2079+i*8, tIdData[2]);
    //                                console.log("写入有效模腔数"+tIdData[3])
    //                                server.setwd(2111+i, tIdData[3]);
    //                             }
    //                        }
    //                     // })

    //                 pblhjStateService.update(id, {state: 1, picker: req.user._id});

    //                 // lhj1 = setTimeout(inter, IntervalTime2);

    //             }

    //             function inter2 () {
    //                 //更新工序状态
    //                 Promise.all(_.map(tIds, item=> {
    //                     return ProdProceService.find({tId: item, sType: 's1'})
    //                 }))
    //                     .then(ProdProceData => {
    //                         for (let i = 0; i < ProdProceData.length; i++) {

    //                             let ProdProceDataStr = ProdProceData[i][0];
    //                             if(ProdProceDataStr) {
    //                                 if (ProdProceDataStr.prodState == 1) {
    //                                     ProdProceDataStr.prodState = 2;
    //                                     ProdProceService.update(ProdProceDataStr._id, ProdProceDataStr)
    //                                 }
    //                             }
    //                         }
    //                         console.log("写入成功")
    //                         res.json({code: 200, msg: '写入成功'});
    //                     })
    //                     .catch(function (e) {
    //                         log.error(e);
    //                         res.status(500).json(e);

    //                     });
    //             }
    //         })
    //         .catch(function (err) {
    //             log.error(err);
    //             res.status(500).json(err);
    //         });
    //     })

});

// 测试socketServer接口
router.post('/pblhjstates/write/client', function (req, res){
    
    let body = req.body;
    logger.info('写入测试,发送',body.eqId,'的数据')
    // logger.info(body)

    pblhjStateService.find({eqId:body.eqId})
    .then(function (docs) {
        socketServer.sendConfig2Client(docs[0])
        res.json({code: 200, msg: '写入成功'});
        // logger.info(docs)
    })
    .catch(function (err) {
        logger.info(err)
        res.status(500).json(err);
    })
})
/*str_temp=str   '把输入的字符串转换成ASCII码值再两两合并成一个16位二进制数

 str_temp2=!mid(str_temp,1,1)     '取字符串最左边第一个字符
 temp0=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 str_temp2=!mid(str_temp,2,1)     '取字符串最左边第二个字符
 temp1=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 第一二位=temp0*256+temp1         '把字符串最左边第一二个字符转换的ASCII码值合并成一个16位二进制数


 str_temp2=!mid(str_temp,3,1)     '取字符串最左边第三个字符
 temp0=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 str_temp2=!mid(str_temp,4,1)     '取字符串最左边第四个字符
 temp1=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 第三四位=temp0*256+temp1         '把字符串最左边第三四个字符转换的ASCII码值合并成一个16位二进制数


 str_temp2=!mid(str_temp,5,1)     '取字符串最左边第五个字符
 temp0=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 str_temp2=!mid(str_temp,6,1)     '取字符串最左边第六个字符
 temp1=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 第五六位=temp0*256+temp1         '把字符串最左边第五六个字符转换的ASCII码值合并成一个16位二进制数

 str_temp2=!mid(str_temp,7,1)     '取字符串最左边第七个字符
 temp0=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 str_temp2=!mid(str_temp,8,1)     '取字符串最左边第八个字符
 temp1=!Ascii2I(str_temp2)        '把该字符转换成ASCII码值

 第七八位=temp0*256+temp1        '把字符串最左边第七八个字符转换的ASCII码值合并成一个16位二进制数*/

//一个寄存器怎样区分两个数值

module.exports = router;