var express = require('express');
var _ = require('lodash');
var router = express.Router();

var lhjStateDataService = require('../services/pblhj_state_data');
var Promise = require('bluebird');
var log = require('../utils/log4js').default();
var moment = require('moment')

/**
 * 查询
 */
router.post('/pblhjmonitor', function (req, res) {
    // var id = "59684085be8a3e1d6c7f4c45";
    // log.info('pblhjmonitor',req.body)
    let eqId =req.body.eqId
    var start = req.body.start;
    var end = req.body.end;

    lhjStateDataService.find({
            // lhjState:id,
            eqId:eqId,
            isLine:1,
            "$and":[{"addDate":{"$gt":moment(start).format('YYYY-MM-DD HH:mm')}},{"addDate":{"$lt":moment(end).format('YYYY-MM-DD HH:mm')}}] // 某个时间段
        },{
            path: 'lhjState'
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
router.post('/pblhjmonitorLastData', function (req, res) {
    var eqIp = req.body.eqIp;
    lhjStateDataService.findLast({isLine:1},{
            path: 'lhjState',
            match: {eqIp: eqIp}
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
router.post('/pblhjmonitorLastData2', function (req, res) {
    var eqIp = req.body.eqIp;

    lhjStateDataService.findLast({},{
            path: 'lhjState',
            match: {eqIp: eqIp}
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
router.post('/pblhjmonitorfilter', function (req, res) {
    var id = "59684085be8a3e1d6c7f4c45";
    var tId = req.body.tId; 
    var mould = req.body.mould; 
    var mId = req.body.mId; 
    var wuId = req.body.wuId; 
    
    lhjStateDataService.find({
           // lhjState:id,
            isLine:1,
            wuId: wuId,
            $or: [
                { $or : [{'firstTask.tId':  tId}, {'firstTask.mjh':  mould}, {'firstTask.mch':  mId}] },
                { $or : [{'secondTask.tId': tId}, {'secondTask.mjh': mould}, {'secondTask.mch': mId}] },
                { $or : [{'thirdTask.tId':  tId}, {'thirdTask.mjh':  mould}, {'thirdTask.mch':  mId}] },
                { $or : [{'fourthTask.tId': tId}, {'fourthTask.mjh': mould}, {'fourthTask.mch': mId}] },

                // { 'firstTask.tId': { tId: tId, mjh: mould, mch: mId } },
                // { 'secondTask.tId': { tId: tId, mjh: mould, mch: mId } },
                // { 'thirdTask.tId': { tId: tId, mjh: mould, mch: mId } },
                // { 'fourthTask.tId': { tId: tId, mjh: mould, mch: mId } },
            ]
        },{
            path: 'lhjState'
        }, {
            // mjh: 1,
            // wuId: 1,
        })
        .then(function (list) {
            console.error('fields:', list);
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

router.post('/pblhjmonitorfilter/mid', function (req, res) {
    var id = "59684085be8a3e1d6c7f4c45";
    var tId = req.body.tId; 
    var mould = req.body.mould; 
    var mId = req.body.mId; 
    var wuId = req.body.wuId; 
    
    lhjStateDataService.find({
           // lhjState:id,
            isLine:1,
            wuId: wuId,
            $or: [
                { $and : [{'firstTask.tId':  tId}, {'firstTask.mjh':  mould}, {'firstTask.mch':  mId}] },
                { $and : [{'secondTask.tId': tId}, {'secondTask.mjh': mould}, {'secondTask.mch': mId}] },
                { $and : [{'thirdTask.tId':  tId}, {'thirdTask.mjh':  mould}, {'thirdTask.mch':  mId}] },
                { $and : [{'fourthTask.tId': tId}, {'fourthTask.mjh': mould}, {'fourthTask.mch': mId}] },
            ]
        },{
            path: 'lhjState'
        }, {
            // mjh: 1,
            // wuId: 1,
        })
        .then(function (list) {
            console.error('fields:', list);
            return res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


router.post('/pblhjmonitorfields', function (req, res) {
    var id = "59684085be8a3e1d6c7f4c45";
    var tId = req.body.tId; 

    console.error('tId:', tId);
    lhjStateDataService.find({
           // lhjState:id,
            isLine:1,
            // wuId:1,
            $or: [
                { "firstTask.tId": tId  },
                { "secondTask.tId": tId  },
                { "thirdTask.tId": tId  },
                { "fourthTask.tId": tId  },
            ]
        },{
            path: 'lhjState'
        }, {
            wuId: 1,
            firstTask: 1,
            secondTask: 1,
            thirdTask: 1,
            fourthTask: 1,
        })
        .then(function (list) {

            var fields = {}, moulds = [], wuIds = []

            list.forEach(function (f) {
                wuIds.push(f.wuId);
                moulds = moulds.concat([f.firstTask.mjh, f.secondTask.mjh, f.thirdTask.mjh, f.fourthTask.mjh]);
            });
            fields.moulds = _.uniq(moulds);
            fields.wuIds = _.uniq(wuIds);

            return res.json(fields);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

module.exports = router;