var express = require('express');
var router = express.Router();
var jwt = require('../utils/jwt');

var log = require('../utils/log4js').default();
var workUserService = require('../services/work_user');
var permissionService = require('../services/permission');
var admin = require('../../global.json').admin;

router.post('/login', function (req, res) {
  workUserService.find(req.body)
    .then(function (list) {
      if (list.length > 0) {
        var user = list[0];

        if (user.wuId === admin.wuId) {
          res.json({
            profile: user,
            token: jwt.encode(user)
          });
          return;
        }

        if (!user.permission) return res.status(403).end();

        permissionService.findById(user.permission)
          .then(function (p) {
            if (p) {
              user.permission = p;

              res.json({
                profile: user,
                token: jwt.encode(user)
              });
            } else {
              res.status(403).end();
            }
          })
          .catch(function (err) {
            log.error(err);
            res.status(500).json(err);
          });
      } else {
        res.status(400).end();
      }
    });
});

module.exports = router;