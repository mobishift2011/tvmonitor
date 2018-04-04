var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var mouldService = require('../services/mould');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/mouldchecks', function (req, res) {
  var userId = req.user._id;

  mouldService.find(_.extend(req.query, {checker: userId}))
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
router.put('/mouldcheck/:id', function (req, res) {
  var id = req.params.id;

  mouldService.updateById(id, { $set: { checkState: 1, state: 2}})
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;