var express = require('express');
var router = express.Router();
var moment = require('moment')
var hxStateDataService = require('../services/hx_state_data');
var hxStateLastDataService = require('../services/hx_state_lastdata');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.post('/hxmonitor', function (req, res) {
    var id = req.body.id;
    var start = req.body.start;
    var end = req.body.end;
    var $and = (start && end) ? 
    [{"addDate": {"$gt": moment(start).format('YYYY-MM-DD HH:mm')}}, {"addDate": {"$lt": moment(end).format('YYYY-MM-DD HH:mm')}}] // 某个时间段
    : [];

    hxStateDataService.find({
            hxState:id,
            isLine: 1,
            "$and": $and
        }, {
            path: 'hxState',
            select: '_id ybCode'
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
 * 查询
 */
router.post('/hxmonitorbytid', function (req, res) {
    var tId = req.body.tId;
    // var start = req.body.start;
    // var end = req.body.end;

    hxStateDataService.find({
            tIds:tId,
            isLine: 1,
        }, {
            path: 'hxState',
            select: '_id ybCode'
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
 * 查询最后一条曲线数据
 */
router.post('/hxmonitorLastData', function (req, res) {
    var ybCode = req.body.ybCode;

    hxStateDataService.findLast({ isLine: 1},{
            path: 'hxState',
            match: {ybCode: ybCode}
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
 * Todo 其实应该查当前时间的数据
 */
router.post('/hxmonitorLastData2', function (req, res) {
    var ybCode = req.body.ybCode;

    hxStateDataService.findLast({}, {
            path: 'hxState',
            match: {ybCode: ybCode}
        })
        .then(function (list) {
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

router.post('/hxmonitorRealTimeData', function (req, res) {
    var tId = req.body.tId;

    hxStateDataService.findLastData({
        tIds:tId,
        isLine: 1
        })
        .then(function (list) {
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


module.exports = router;