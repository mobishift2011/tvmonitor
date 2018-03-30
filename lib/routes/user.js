var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var userService = require('../services/user');
var log = require('../utils/log4js').default();
var admin = require('../../global.json').admin;

/**
 * 默认初始化超级管理员
 */


userService.find({
  username: admin.username
}).then(function (models) {
  if (!models.length) {
    userService.save(admin);
  }
});

/**
 * 查询用户
 */
router.get('/users', function (req, res) {
  userService.find()
    .then(function (list) {
      res.json(list.filter(function (item) {
        return item.username !== admin.username;
      }));
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 新增用户
 */
router.post('/user', function (req, res) {
  var body = req.body;
  var error = userService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  userService.find({username: body.username})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '用户名已存在'
        });
      } else {
        userService.save(body)
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
 * 修改用户
 */
router.put('/user/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  var error = userService.valid(body);

  if (error) {
    return res.status(400).json({
      error: error
    });
  }

  userService.find({username: body.username, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '用户名已存在'
        });
      } else {
        userService.update(id, _.extend(body, {updateDate: new Date()}))
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
 * 删除用户
 */
router.delete('/user/:id', function (req, res) {
  var id = req.params.id;

  userService.remove(id)
    .then(function () {
      res.end();
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;