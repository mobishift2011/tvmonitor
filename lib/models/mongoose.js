var mongoose = require('mongoose');
var log = require('../utils/log4js').default();
var Promise = require('bluebird');
var isDev = require('../../global.json').isDev;
var db_config = isDev ? require('../../global.json').dev_db : require('../../global.json').db
mongoose.Promise = Promise;

// mongoose.connect('mongodb://localhost/tvmonitor4');
mongoose.connect(db_config)


var db = mongoose.connection;
db.on('error', function (err) {
    log.error('Mongodb ' + err);
});
db.once('open', function () {
    log.info('Mongodb has connected');
});

module.exports = mongoose;