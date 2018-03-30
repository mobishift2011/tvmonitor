var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProceService = require('../services/prod_proce');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/procechecks', function (req, res) {
  var userId = req.user._id;

  prodProceService.find({checker: userId})
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
router.put('/procecheck/:id', function (req, res) {
  var id = req.params.id;
  let params={};
  if(req.body.prodState){
      params=req.body
  }else{
    params=_.extend({state: 1}, req.body)
  }
  prodProceService.update(id, params)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;