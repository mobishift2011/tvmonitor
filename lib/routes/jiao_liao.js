var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var jiaoLiaoService = require('../services/jiao_liao');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/jiaoliaos', function (req, res) {
  jiaoLiaoService.find(req.query)
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});


/**
 * 查询
 */
router.get('/jiaoliao/:id', function (req, res) {
  var id = req.params.id;

  jiaoLiaoService.findById(id)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 新增
 */
router.post('/jiaoliao', function (req, res) {
  var body = req.body;
  var userId = req.user._id;
  jiaoLiaoService.save(_.extend(body, {adder: userId}))
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 修改
 */
router.put('/jiaoliao/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  jiaoLiaoService.update(id, body)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 删除
 */
router.delete('/jiaoliao/:id', function (req, res) {
  var id = req.params.id;

  jiaoLiaoService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;