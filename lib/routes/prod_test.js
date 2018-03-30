var express = require('express');
var router = express.Router();
var _ = require('lodash');
var Promise = require('bluebird');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var prodProceService = require('../services/prod_proce');
var jiaoLiaoService = require('../services/jiao_liao');
var jiaoLiaoStateService = require('../services/jiao_liao_state');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodtests', function (req, res) {
  var userId = req.user._id;

  prodProdService.find(_.extend(req.query, {tester: userId}))
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
router.put('/prodtest/:id', function (req, res) {
  var id = req.params.id;
  var data;

  prodProdService.update(id, {state: 6, staTime: new Date()})
    .then(function (prod) {
      data = prod;
      var len = prod.wp.length;
      return Promise.map(_.cloneDeep(prod.wp).reverse(), function (item, index) {
        var realIndex = len - index - 1;
        prodProceService.save({
          ppId: id,
          tId: prod.tId,
          eqId: prod.eqId,
          wp: item.title,
          sType: item.sType,
          index: realIndex,
          wpc: item.child,
          time: prod.times[realIndex],
          worker: prod.picker
        })
      });
    })
    .then(function () {
      return jiaoLiaoService.updateByCondition({rId: data.rId}, {$inc: {total: -data.sNum}, state: 2});
    })
    .then(function (jl) {
      return jiaoLiaoStateService.save({
        jlId: jl._id,
        tId: data.tId,
        mId: data.mId,
        num: data.sNum,
        state: 2,
        picker: data.picker,
        adder: data.issuer,
        checker: data.tester,
        checked: 1
      });
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