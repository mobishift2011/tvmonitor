var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var workShopService = require('../services/work_shop');
var workGroupService = require('../services/work_group');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/workshops', function (req, res) {
  workShopService.find()
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
router.post('/workshop', function (req, res) {
  var body = req.body;

  workShopService.find({wsId: body.wsId})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '车间编号已存在'
        });
      } else {
        var userId = req.user._id;
        workShopService.save(_.extend(body, {adder: userId, updater: userId}))
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
router.put('/workshop/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  workShopService.find({wsId: body.wsId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '车间编号已存在'
        });
      } else {
        var userId = req.user._id;
        workShopService.update(id, _.extend(body, {updateDate: new Date(), updater: userId}))
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
router.delete('/workshop/:id', function (req, res) {
  var id = req.params.id;

  workGroupService.find({wsId: id})
    .then(function (list) {
      if (list.length) {
        res.status(409).json({error: '车间已绑定班组，无法删除！'});
      } else {
        workShopService.remove(id)
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