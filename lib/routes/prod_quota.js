var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodquotas', function (req, res) {
  var userId = req.user._id;

  prodProdService.find(_.extend(req.query, {quotaer: userId}))
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 修改状态
 */
router.put('/prodquota/:id', function (req, res) {
  var id = req.params.id;

  prodProdService.update(id, {state: 2, times: req.body.times})
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;