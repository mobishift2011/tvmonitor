var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var jiaoLiaoService = require('../services/jiao_liao');
var jiaoLiaoStateService = require('../services/jiao_liao_state');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/jiaoliaostatechecks', function (req, res) {
  var userId = req.user._id;

  jiaoLiaoStateService.find({ $or: [ { checker: userId }, { jlKeeper: userId } ],checked:0 })
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
router.put('/jiaoliaostatecheck/:id', function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var data, update;

  jiaoLiaoStateService.update(id, _.extend({checked: 1}, body))
    .then(function (jlState) {
      data = jlState;

      if (data.state === 3 || data.state === 4) {
        update = {$inc: {total: -jlState.num}, lDate: jlState.cDate};
      }

      if (data.state === 4) {
        update = {$inc: {total: -jlState.num},jlKeeper:data.jlKeeper};
      }

      if (data.state === 5) {
        update = {$inc: {total: jlState.num},jlKeeper:data.jlKeeper};
      }

      if (data.state === 6) {
        update = {total: 0};
      }

      return jiaoLiaoService.update(jlState.jlId, _.extend({state: data.state}, update));

    })
    .then(function () {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;