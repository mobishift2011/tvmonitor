var express = require('express');
var router = express.Router();

var constant = require('../utils/constant');
var prodLibraryService = require('../services/proce_library');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/procelibrarychecks', function (req, res) {
    var userId = req.user._id;

    prodLibraryService.find({checker: userId})
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
router.put('/procelibrarycheck/:id', function (req, res) {
    var id = req.params.id;

    prodLibraryService.update(id, {state: 1})
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

module.exports = router;