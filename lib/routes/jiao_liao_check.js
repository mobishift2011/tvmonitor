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
router.get('/jiaoliaochecks', function (req, res) {
  var userId = req.user._id;

  jiaoLiaoService
    .find({checker: userId,state:0,checked: 0 })
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
router.put('/jiaoliaocheck/:id', function (req, res) {
  var id = req.params.id;
  var userId = req.user._id;

  var data;
  jiaoLiaoService.update(id, {checked: 1, state: 1})
    .then(function (jl) {
      data = jl;

      return jiaoLiaoStateService.save({
        jlId: id,
        state: 1,
        adder: userId,
        num: jl.total,
        checker: jl.checker,
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