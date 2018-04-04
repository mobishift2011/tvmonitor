var express = require('express');
var router = express.Router();
var WsdStateService = require('../services/wsd_state');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/wsdstates', function (req, res) {
    WsdStateService.find(id)
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


module.exports = router;