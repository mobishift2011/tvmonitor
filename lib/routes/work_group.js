var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var workGroupService = require('../services/work_group');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/workgroups', function (req, res) {
  workGroupService.find()
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
router.post('/workgroup', function (req, res) {
  var body = req.body;

  workGroupService.find({wgId: body.wgId})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '班组编号已存在'
        });
      } else {
        var userId = req.user._id;
        workGroupService.save(_.extend(body, {adder: userId, updater: userId}))
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
 * 修改
 */
router.put('/workgroup/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  workGroupService.find({wgId: body.wgId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '班组编号已存在'
        });
      } else {
        var userId = req.user._id;
        workGroupService.update(id, _.extend(body, {updateDate: new Date(), updater: userId}))
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
router.delete('/workgroup/:id', function (req, res) {
  var id = req.params.id;

  workGroupService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;