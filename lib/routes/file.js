var express = require('express');
var router = express.Router();

var constant = require('../utils/constant');
var fileService = require('../services/file');
var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/file/:id', function (req, res) {
  var id = req.params.id;

  fileService.getDataById(id)
    .then(function (file) {
      res.setHeader('Content-disposition', 'attachment; filename=' + encodeURIComponent(file.name));
      res.setHeader('Content-type', file.type);
      res.setHeader('Content-Length', file.size);
      res.send(file.data);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});


module.exports = router;