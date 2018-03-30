var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProceService = require('../services/prod_proce');
var mouldService = require('../services/mould');
var mouldStateService = require('../services/mould_state');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/mouldstates', function (req, res) {
  var userId = req.user._id;

  mouldStateService.find(_.extend(req.query, {checker: userId}))
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
router.put('/mouldstate/:id', function (req, res) {
  var body = req.body;
  var id = req.params.id;

  mouldStateService.update(id, {checked: 2})
    .then(function (state) {
      return state.tId;
    })
    .then(function (tId) {

      if (body.state == 2) {
        return prodProceService.find({tId: tId});
      }

      return [];
    })
    .then(function (proces) {
      var inc = 0;

      proces.forEach(function (item) {
        inc += item.qNum;
      });

      // return mouldService.updateById(body.mId, {state: body.state, $inc: { total: inc }});
      return mouldService.updateById(body.mId, {state: body.state});
    })
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;