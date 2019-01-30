/**
 * jwt控制
 */
var jwt = require('jwt-simple');
var _ = require('lodash');
var moment = require('moment');

var log = require('../utils/log4js').default();
var tokenKey = require('../../global.json').tokenKey;
var authTokenService = require('../services/auth_token');

module.exports = {
  /**
   * jwt加密，过期时间1h
   * @param user
   * @returns {*}
   */
  encode: function (user) {
    payload = _.extend({ user: user, expire: moment().add(60, 'minutes').valueOf() });
    token = jwt.encode(payload, tokenKey, 'HS256');
    authTokenService.remove({ user: user });
    authTokenService.save({ user: user, token: token });
    return token
  },
  /**
   * jwt解密
   * @param token
   * @returns {*}
   */
  decode: async function (token) {
    if (!token) return false;

    try {
      var payload = jwt.decode(token, tokenKey);
      var user = payload.user;

      var list = await authTokenService.find({ token: token });

      if (!list.length) {
        return false;
      }

      var now = moment();
      var expire = moment(payload.expire);

      if (expire.isBefore(now)) return false;
    } catch (err) {
      log.error(err);
      return false;
    }

    return payload.user;
  }
};