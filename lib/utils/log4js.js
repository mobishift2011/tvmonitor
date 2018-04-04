/**
 * 日志
 */

var log4js = require('log4js');

log4js.configure({
  appenders: [
    {
      type: 'console',
      category: 'socketio'
    },
    {
      type: 'file',
      filename: 'logs/default.log',
      maxLogSize: 20971520,
      backups: 10,
      category: 'default'
    },
    {
      type: 'file',
      filename: 'logs/access.log',
      maxLogSize: 20971520,
      backups: 10,
      category: 'access'
    },
    {
      type: 'file',
      filename: 'logs/socketio.log',
      maxLogSize: 20971520,
      backups: 10,
      category: 'socketio'
    }
  ],
  replaceConsole: true
});

module.exports = {
  default: function () {
    return log4js.getLogger('default');
  },
  access: function () {
    return log4js.connectLogger(log4js.getLogger('access'), {
      level: log4js.levels.INFO,
      format: ':remote-addr :method :url HTTP/:http-version :status ":user-agent" :response-timems',
      nolog: /\/static\/.*/
    })
  },
  socketio:function () {
    return log4js.getLogger('socketio')
  }
};