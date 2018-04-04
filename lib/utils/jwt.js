/**
 * jwt控制
 */
var jwt = require('jwt-simple');
var _ = require('lodash');
var moment = require('moment');

var log = require('../utils/log4js').default();
var tokenKey = require('../../global.json').tokenKey;

module.exports = {
  /**
   * jwt加密，过期时间1h
   * @param user
   * @returns {*}
   */
  encode: function (user) {
    payload = _.extend({user: user, expire: moment().add(60, 'minutes').valueOf()});
    return jwt.encode(payload, tokenKey, 'HS256');
  },
  /**
   * jwt解密
   * @param token
   * @returns {*}
   */
  decode: function (token) {
    if (!token) return false;

    try {
      var payload = jwt.decode(token, tokenKey);
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