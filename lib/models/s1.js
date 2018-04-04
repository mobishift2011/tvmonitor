var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 一段硫化
 */
var S1Schema = new Schema({
  eqId: String,                    // 设备编号
  tId: String,                     // 任务号
  time: Number,                    // 模次
  sj: Number,                      // 硫化时长
  wd: Number,                      // 温度
  yl: Number,                      // 压力
  flag: Number,                    // 判断标识
  date: {                          // 添加时间
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('S1', S1Schema);