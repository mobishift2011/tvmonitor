var express = require('express');
var router = express.Router();
var _ = require('lodash');

var constant = require('../utils/constant');
var prodProdService = require('../services/prod_prod');
var prodProceService = require('../services/prod_proce');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/allplans', function (req, res) {
    prodProdService.find(req.query)
        .then(function (list) { 
            res.json(list);
        })      
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

/**
 * 查询
 */
router.get('/allplan/:id', function (req, res) {
    var id = req.params.id;

    var response = {};  

    prodProdService.findById(id)
        .then(function (data) {
            response.plan = data;
            return prodProceService.find({ppId: id});
        })
        .then(function (list) {
            response.wps = list;
            res.json(response);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});


/**
 * 查询
 */
/*router.get('/allplanByPicker/:id', function (req, res) {
    var id = req.params.id;

    var response = {};  

    prodProdService.find({picker: id})
        .then(async (data) => {
            response.plan = data || [];

         return Promise.all(data.map(async (item) => {
                return prodProceService.find({ppId: item._id});
            }))

        })
        .then(function (list) {
            var dataLi = [];
            list.forEach(li => {
                dataLi = dataLi.concat(li);
            });

            response.wps = dataLi;
            var plan = [];

            dataLi.forEach(li => {
                response.plan.forEach( p => {
                    if (li.prodState === 0 && p.tId === li.tId){
                        plan.push(p);
                    }
                })
            })
            response.plan = _.uniqBy(plan, 'tId');
            res.json(response);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});*/


router.get('/allplanByPicker/:id', function (req, res) {
    var id = req.params.id;

    prodProdService.find({picker: id})
        .then(async (data) => {
            res.json(data);
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
        });
});

module.exports = router;