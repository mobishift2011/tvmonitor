var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var mouldStateService = require('../services/mould_state');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/prodpicks', function (req, res) {
  var userId = req.user._id;

  prodProdService.find(_.extend(req.query, {picker: userId}))
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

/**
 * 修改状态
 */
router.put('/prodpick/:id', function (req, res) {
  var id = req.params.id;
  var body = req.body;
  var mLen = body.mould.mIds.length;
  var mIds = [].concat(body.mould.mIds);
  delete body.mould.mIds;

  prodProdService.update(id, body.prod)
    .then(function (prodData) {
      mIds.forEach( (mId, index) => {
        mouldStateService.find({mId: mId, checked: 1})
            .then(function (list) {
                if (list.length) {
                    res.status(409).end();
                } else {
                   var userId = req.user._id;
                  body.mould.mId = mId;
                  mouldStateService.save(_.extend(body.mould, {applyer: userId}))
                      .then(function () {
                          if (mLen === index+1) {
                            res.json(prodData);
                          }
                      })
                      .catch(function (err) {
                          log.error(err);
                          res.status(500).json(err);
                      });
                }
            });
      });
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});

module.exports = router;