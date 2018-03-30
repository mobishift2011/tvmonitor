var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProceService = require('../services/prod_proce');
var s1Service = require('../services/s1');
var s2Service = require('../services/s2');
var log = require('../utils/log4js').default();


var devices = [
  {id: '444444', ip: '192.168.1.1', s1: true},
  {id: '555555', ip: '192.168.1.2', s2: true}
];


/**
 * 查询
 */
router.get('/monitorproces', function (req, res) {
  prodProceService.find({show: true})
    .then(function (list) {
      res.json(list.filter(item => item.ppId && item.ppId.state === 6));
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

router.get('/monitorproce/devices', function (req, res) {
  res.json(devices);
});

router.get('/monitorproce/proces', function (req, res) {
  prodProceService.find(req.params)
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 获取数据
 */
router.get('/monitorproce/data/s1', function (req, res) {
  var eqId = req.query.eqId;

  var device = _.find(devices, {id: eqId});

  s1Service.save({
    eqId: eqId,
    tId: 'tttttt',
    lhl: (Math.random() * 100).toFixed(2),
    smt: (Math.random() * 100).toFixed(2),
    xmt: (Math.random() * 100).toFixed(2),
    yl: (Math.random() * 100).toFixed(2)
  })
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });


});

router.get('/monitorproce/data/s2', function (req, res) {
  var eqId = req.query.eqId;

  var device = _.find(devices, {id: eqId});

  s2Service.save({
    eqId: eqId,
    tId: 'tttttt',
    temp: (Math.random() * 100).toFixed(2),
    st: (Math.random() * 100).toFixed(2),
    ct: (Math.random() * 100).toFixed(2)
  })
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;