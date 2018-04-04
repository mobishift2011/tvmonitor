const log4js = require('log4js')
const path = require('path')
log4js.configure({
  appenders: {
    file: {
      type: 'file',
      filename: path.join(__dirname, '../log/lhj.log'),
      maxLogSize: 10 * 1024 * 1024, // = 10Mb
      backups: 3,
      compress: true,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ['file'], level: 'info' }
  }
})
const logger = log4js.getLogger('lhj')
logger.info('read', [123])
module.exports.logger = logger
