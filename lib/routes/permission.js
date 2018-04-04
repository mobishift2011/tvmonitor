var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var permissionService = require('../services/permission');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/permissions', function (req, res) {
  permissionService.find()
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
router.post('/permission', function (req, res) {
  var body = req.body;
  var error = permissionService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  permissionService.find({name: body.name})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '权限名称已存在'
        });
      } else {
        var userId = req.user._id;
        permissionService.save(_.extend(body, {adder: userId, updater: userId}))
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
router.put('/permission/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  var error = permissionService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  permissionService.find({name: body.name, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '车间编号已存在'
        });
      } else {
        var userId = req.user._id;
        permissionService.update(id, _.extend(body, {updater: userId, updateDate: new Date()}))
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
router.delete('/permission/:id', function (req, res) {
  var id = req.params.id;

  permissionService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;