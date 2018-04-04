var express = require('express');
var router = express.Router();
var moment = require('moment')
var wsdDataService = require('../services/wsd_data');
var WsdStateService = require('../services/wsd_state');

var log = require('../utils/log4js').default();
var wsds = require('../../global.json').wsd;
var Modbus = require('../utils/ModBus.js')

/**
 * 查询
 */
router.post('/wsdmonitor', function (req, res) {
    var eqIp = req.body.eqIp;
    var start = req.body.start;
    var end = req.body.end;

    wsdDataService.find({
            wsdIp: eqIp,
        // "$and": [{"addDate": {"$gt": moment("‌2017-08-29 03:51").format('YYYY-MM-DD HH:mm')}}, {"addDate": {"$lt": moment("‌2017-08-29 04:51").format('YYYY-MM-DD HH:mm')}}] // 某个时间段
            "$and": [{"addDate": {"$gt": moment(start).format('YYYY-MM-DD HH:mm')}}, {"addDate": {"$lt": moment(end).format('YYYY-MM-DD HH:mm')}}] // 某个时间段
        })
        .then(function (list) {
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

/**
 * 查询最后一条数据
 */
router.post('/wsdmonitorLastData', function (req, res) {
    var eqIp = req.body.eqIp;
    wsdDataService.findLast({wsdIp: eqIp})
        .then(function (list) {
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});
/**
 *
 */
router.post('/wsdmonitor/connectState', function (req, res) {
    // return res.json({'dictCode': '1', 'dictName': '连接'});
    WsdStateService.find()
        .then(function (data) {
            if(data[0].connectState==1){
                return res.json({'dictCode': '1', 'dictName': '连接'});
            }else{
                return res.json({'dictCode': '2', 'dictName': '未连接'});
            }
            res.json(data);
        })
        .catch(function (err) {
            log.error(err);
            return res.json({'dictCode': '0', 'dictName': '未连接'});
        });


    //
    // let option = {
    //     ip: wsd.eqIp,
    //     id: wsd.eqId,
    //     port: wsd.eqPort
    // }
    // let wsdMd = new Modbus(option);
    // wsdMd.isOpen().then(function () {
    //         return res.json({'dictCode': '1', 'dictName': '连接'});
    //     })
    //     .catch(function () {
    //         return res.json({'dictCode': '2', 'dictName': '未连接'});
    //
    //     })
});


module.exports = router;