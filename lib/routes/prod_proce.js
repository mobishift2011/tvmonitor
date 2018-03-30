var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProceService = require('../services/prod_proce');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodproces', function (req, res) {
  var userId = req.user._id;

  prodProceService.find({worker: userId})
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 修改
 */
router.put('/prodproce/:id', function (req, res) {
  var id = req.params.id;

  req.body.checker = req.body.checker || null;

  prodProceService.update(id, req.body)
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
router.delete('/prodproce/:id', function (req, res) {
  var id = req.params.id;

  prodProceService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;