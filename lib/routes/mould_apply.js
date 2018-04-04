  var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var mouldService = require('../services/mould');
var mouldStateService = require('../services/mould_state');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/mouldapplys', function (req, res) {
  var userId = req.user._id;

  mouldStateService.find(_.extend(req.query, {applyer: userId}))
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
router.post('/mouldapply', function (req, res) {
  var body = req.body;

  mouldStateService.find({mId: body.mId, checked: 1})
    .then(function (list) {
      if (list.length) {
        res.status(409).end();
      } else {
        var userId = req.user._id;

        mouldStateService.save(_.extend(body, {applyer: userId}))
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
router.put('/mouldapply/:id', function (req, res) {
  var id = req.params.id;
  var body = req.body;

  mouldStateService.update(id, body)
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
router.delete('/mouldapply/:id', function (req, res) {
  var id = req.params.id;

  mouldStateService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;