var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var jiaoLiaoStateService = require('../services/jiao_liao_state');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/jiaoliaostates', function (req, res) {
  jiaoLiaoStateService.find(req.query)
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});


/**
 * 新增
 */
router.post('/jiaoliaostate', function (req, res) {
  var body = req.body;
  var userId = req.user._id;

  new Promise(function (resolve) {
    if (body.state == 5) {//退库
      prodProdService.findOne({tId: body.tId})
        .then(function (prod) {
          resolve(prod && prod.cId);
        });
    } else {
      resolve('');
    }
  }).then(function (cId) {
    //jiaoLiaoStateService.find({jlId:body.jlId})
    //  .then(function(jlState){
    //    if(jlState.length==0){
          jiaoLiaoStateService.save(_.extend(body, {adder: userId, cId: cId}))
              .then(function (data) {
                res.json(data);
              })
              .catch(function (err) {
                log.error(err);
                res.status(500).json(err);
              });
      //  }else{
      //    jiaoLiaoStateService.update(jlState[0]._id, _.extend(body, {cId: cId}))
      //        .then(function (data) {
      //          res.json(data);
      //        })
      //        .catch(function (err) {
      //          log.error(err);
      //          res.status(500).json(err);
      //        });
      //  }
      //})
      //.catch(function(err){
      //  log.error(err);
      //  res.status(500).json(err);
      //})

  });
});

/**
 * 修改
 */
router.put('/jiaoliaostate/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  jiaoLiaoStateService.update(id, body)
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
router.delete('/jiaoliaostate/:id', function (req, res) {
  var id = req.params.id;

  jiaoLiaoStateService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;