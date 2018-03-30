var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var workUserService = require('../services/work_user');
var workGroupService = require('../services/work_group');
var log = require('../utils/log4js').default();

var admin = require('../../global.json').admin;

/**
 * 默认初始化超级管理员
 */

workUserService.find({
  wuId: admin.wuId
}).then(function (models) {
  if (!models.length) {
    workUserService.save(admin);
  }
});

/**
 * 查询
 */
router.get('/workusers', function (req, res) {
  workUserService.find()
    .then(function (list) {
      res.json(list.filter(function (item) {
        return item.wuId !== admin.wuId;
      }));
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 查询部分field
 */
router.get('/workusers/field', function (req, res) {
  workUserService.findField()
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
router.post('/workuser', function (req, res) {
  var body = req.body;
  var error = workUserService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  workUserService.find({wuId: body.wuId})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '员工工号已存在'
        });
      } else {
        var userId = req.user._id;
        workUserService.save(_.extend(body, {adder: userId, updater: userId}))
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
router.put('/workuser/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  var error = workUserService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  workUserService.find({wuId: body.wuId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '员工工号已存在'
        });
      } else {
        var userId = req.user._id;
        workUserService.update(id, _.extend(body, {updateDate: new Date(), updater: userId}))
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
router.delete('/workuser/:id', function (req, res) {
  var id = req.params.id;

  workGroupService.find({wus: id})
    .then(function (list) {
      if (list.length) {
        res.status(409).json({error: '员工已添加到班组，无法删除！'});
      } else {
        workUserService.remove(id)
          .then(function () {
            res.end();
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      }
    });
});

module.exports = router;