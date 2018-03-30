var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 二段硫化
 */
var S2Schema = new Schema({
  eqId: String,                    // 设备编号
  tIds: [String],                  // 任务号
  wd: Number,                      // 温度
  sj: Number,                      // 标准时间
  flag: Number,                    // 标识
  date: {                          // 添加时间
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('S2', S2Schema);