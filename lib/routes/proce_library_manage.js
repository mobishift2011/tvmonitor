var express = require('express');
var router = express.Router();

var constant = require('../utils/constant');
var prodLibraryService = require('../services/proce_library');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/procelibrarymanages', function (req, res) {
    var userId = req.user._id;

    prodLibraryService.find({manager: userId})
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
router.put('/procelibrarymanage/:id', function (req, res) {
    var body = req.body;
    delete  body._id;

    var id = req.params.id;

    prodLibraryService.update(id, body)
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
router.delete('/procelibrarymanage/:id', function (req, res) {
    var id = req.params.id;

    prodLibraryService.remove(id)
      .then(function () {
          res.end();
      })
      .catch(function (err) {
          log.error(err);
          res.status(500).json(err);
      });
});

module.exports = router;