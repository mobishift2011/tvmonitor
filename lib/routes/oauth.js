var _ = require('lodash');
var jwt = require('../utils/jwt');
var log = require('../utils/log4js').default();
var admin = require('../../global.json').admin;

module.exports = function (req, res, next) {
  var token = req.headers.authorization;
  jwt.decode(token).then(user => {
    try {
      if (/\/api\/.*/.test(req.url)) {
        if (!user && !/\/api\/file\/.*/.test(req.url)) return res.status(401).end();

        if (req.method !== 'GET' && user.wuId !== admin.wuId) {

          var permission = user.permission || {};

          var path = req.url;
          var paths = permission.paths;


          var allow = _.some(paths, function (p) {
            return path.indexOf(p) > -1;
          });

          console.error("allow", allow);

          if (!allow) {
            return res.status(403).end();
          }
        }
      }
    } catch (err) {
      log.error(err);
      res.status(401).end();
      return;
    }

    req.user = user;
    next();
  });
};