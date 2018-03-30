var express = require('express');
var router = express.Router();
var _ = require('lodash');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var upload = multer({dest: 'tmps/'});

var constant = require('../utils/constant');
var prodLibraryService = require('../services/proce_library');
var fileService = require('../services/file');

var log = require('../utils/log4js').default();

/**
 * 查询
 */
router.get('/procelibrarys', function (req, res) {

  prodLibraryService.find(req.query)
    .then(function (list) {
      res.json(list);
    })
    .catch(function (err) {
      log.error(err);
      res.status(500).json(err);
    });
});


router.post('/procelibrary/upload', upload.single('file'), function (req, res) {

  var file = req.file;
  var content = fs.readFileSync(path.join(process.cwd(), file.path));

  fileService.save({
    name: file.originalname,
    type: file.mimetype,
    data: content,
    size: file.size
  })
    .then(function (data) {
      res.json(data);
    });
});


/**
 * 新增
 */
router.post('/procelibrary', function (req, res) {
  var body = req.body;

  if (req.query) {
    body.wp.forEach(w => {
      w.child.forEach(c => {
        c.key = c.key.trim();
      });
    });
  }

  prodLibraryService.find({mId: body.mId})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '产品图号已存在'
        });
      } else {
        var userId = req.user._id;
        prodLibraryService.save(_.extend(body, {skiller: userId}))
          .then(function (data) {
            res.json(data);
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      }
    });
});

/**
 * 修改
 */
router.put('/procelibrary/:id', function (req, res) {
  var body = req.body;
  delete  body._id;

  var id = req.params.id;
  
if (req.query) {
    body.wp.forEach(w => {
      w.child.forEach(c => {
        c.key = c.key.trim();
      });
    });
  }

  prodLibraryService.find({mId: body.mId, _id: {$ne: id}})
    .then(function (list) {
      if (list.length > 0) {
        res.status(400).json({
          error: '产品图号已存在'
        });
      } else {
        return prodLibraryService.update(id, body)
          .then(function (data) {
            res.json(data);
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      }
    });
});

/**
 * 删除
 */
router.delete('/procelibrary/:id', function (req, res) {
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