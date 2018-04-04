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
router.get('/moulds', function (req, res) {
  
  mouldService.find(req.query)
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 查询状态
 */
router.get('/mould/state/:mId', function (req, res) {
  var mId = req.params.mId;

  var mould;
  mouldService.findById(mId)
    .then(function (data) {
      mould = data;
      return mouldStateService.find(_.extend({mId: mId}, req.query));
    })
    .then(function (list) {
      res.json({
        mould: mould,
        states: list
      });
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 新增
 */
router.post('/mould', function (req, res) {
  var body = req.body;

  mouldService.find({mapId: body.mapId})
    .then(function (list) {
      //if (list.length > 0) {
      //  res.status(400).json({
      //    error: '图号已存在'
      //  });
      //} else {
        var userId = req.user._id;
        mouldService.save(_.extend(body, {adder: userId}))
          .then(function (data) {
            res.json(data);
          });
      //}
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });

});


/**
 * 新增状态
 */
router.post('/mould/state', function (req, res) {
  var body = req.body;

  mouldStateService.find({mId: body.mId, checked: 1})
    .then(function (list) {
      if (list.length) {
        res.status(409).end();
      } else {
        mouldStateService.save(_.extend(body))
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
router.put('/mould/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  mouldService.find({mapId: body.mapId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '图号已存在'
        });
      } else {
        mouldService.updateById(id, body)
          .then(function (data) {
            res.json(data);
          });
      }
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 删除
 */
router.delete('/mould/:id', function (req, res) {
  var id = req.params.id;

  mouldService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;