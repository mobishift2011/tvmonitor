var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var prodProceService = require('../services/prod_proce');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/procetests', function (req, res) {
  var userId = req.user._id;

  prodProceService.find({tester: userId})
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
router.put('/procetest/:id', function (req, res) {
  var id = req.params.id;
  var body = req.body;
  var ppId = body.ppId;
  var wp = body.wp;
  var index = body.index;
  let params={};
  if(body.prodState){
      prodProceService.update(id, body)
          .then(function (data) {
              res.json(data);
          })
          .catch(function (err) {
              log.error(err);
              res.status(500).json(err);
          });
  }else{
      if (!parseInt(body.qNum)) {
          if(body.prodState){
            params=_.extend(body, {date: new Date()})
          }else{
            params=_.extend(body, {state: 2, date: new Date()})
          }
          prodProdService.update(ppId, {state: 20, cwp: wp})
              .then(function () {
                  return prodProceService.update(id, params)
              })
              .then(function (data) {
                  res.json(data);
              })
              .catch(function (err) {
                  log.error(err);
                  res.status(500).json(err);
              });
      } else {
          prodProdService.findById(ppId)
              .then(function (prod) {
                  if (prod.wp.length === (index + 1)) {
                      return prodProdService.update(ppId, {state: 10, qNum: body.qNum})
                  } else {
                      return Promise.resolve();
                  }
              })
              .then(function () {
                  var date = new Date();
                  var cycle = 0;

                  if (index > 0) {
                      return prodProceService.findOne({index: index - 1, ppId: ppId})
                          .then(function (prevProce) {
                              cycle = +date - +prevProce.date;
                              if(body.prodState){
                                  params=_.extend(body, {date: date, cycle: cycle})
                              }else{
                                  params=_.extend(body, {state: 2, date: date, cycle: cycle})
                              }
                              return prodProceService.update(id, params);
                          });
                  }
                  if(body.prodState){
                      params=_.extend(body, {date: new Date()})
                  }else{
                      params=_.extend(body, {state: 2, date: new Date()})
                  }
                  return prodProceService.update(id, params)
              })
              .then(function (data) {
                  res.json(data);
              })
              .catch(function (err) {
                  log.error(err);
                  res.status(500).json(err);
              });
      }
  }


});

module.exports = router;