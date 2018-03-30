var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodprods', function (req, res) {
   var userId = req.user._id;
  // var userId="590e989039054d1b5caf570c"
   //‌59633a8d4e4426179c71701a
  // prodProdService.find({skiller: userId})
  prodProdService.find()
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
router.put('/prodprod/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;

  prodProdService.update(id, body)
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
router.delete('/prodprod/:id', function (req, res) {
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

/**
 * 查询
 */
router.get('/prodprods4lh', function (req, res) {
    prodProdService.find()
        .then(function (list) {
            res.json(list);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

module.exports = router;