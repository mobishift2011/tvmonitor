var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodplans', function (req, res) {
  var userId = req.user._id;

  prodProdService.find({planer: userId})
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
router.post('/prodplan', function (req, res) {
  var body = req.body;

  prodProdService.find({tId: body.tId})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '任务号已存在'
        });
      } else {
        var userId = req.user._id;
        prodProdService.save(_.extend(body, {planer: userId}))
          .then(function (data) {
            res.json(data);
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      }
    });
});

/**
 * 修改
 */
router.put('/prodplan/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  prodProdService.find({tId: body.tId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '任务号已存在'
        });
      } else {
        return prodProdService.update(id, body)
          .then(function (data) {
            res.json(data);
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      }
    });
});

/**
 * 删除
 */
router.delete('/prodplan/:id', function (req, res) {
  var id = req.params.id;

  prodProdService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;