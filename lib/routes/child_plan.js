var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var prodProceService = require('../services/prod_proce');
var lhjStateDataService = require('../services/pblhj_state_data');
var log = require('../utils/log4js').default();

function add_wps(wps, data) {
    if (wps && wps.length) {
        wps.forEach(item => {
            item.ppId = data._id;
            item.tId = data.tId;
            prodProceService.save(item);
        });
    }
}

function add_pblhj_state_datas(prod) {
    let ptId = prod.ptId;
    let tId = prod.tId;
    lhjStateDataService.find({
        $or: [
            { "firstTask.tId": ptId },
            { "secondTask.tId": ptId },
            { "thirdTask.tId": ptId },
            { "fourthTask.tId": ptId },
        ]
    }, {
            path: 'lhjState'
        }, {
            // mjh: 1,
            // wuId: 1,
        })
        .then(function (list) {
            list.forEach(function (e) {
                let f = JSON.parse(JSON.stringify(e))
                let items = [
                    'firstTask',
                    'secondTask',
                    'thirdTask',
                    'fourthTask'
                ];
                items.forEach(item => {
                    if (f[item].tId == ptId) {
                        f[item].tId = tId;
                    } else {
                        f[item] = {};
                    }
                });

                delete f._id;
                lhjStateDataService.save(f);
            });
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
}

/**
 * 新增子任务
 */
router.post('/childplan',
    function (req, res) {
        var body = req.body;

        prodProdService.find({ tId: body.tId })
            .then(function (list) {
                if (list.length > 0) {
                    res.status(400).json({
                        error: '任务号已存在'
                    });
                } else {
                    var userId = req.user._id;
                    prodProdService.save(body)
                        .then(function (data) {
                            //拷贝工艺到子任务
                            add_wps(body.wps, data);
                            //拷贝硫化机历史数据到子任务
                            add_pblhj_state_datas(data);
                            res.json(data);
                        })
                        .catch(function (err) {
                            log.error(err);
                            res.status(500).json(err);
                        });
                }
            });
    });

module.exports = router;
