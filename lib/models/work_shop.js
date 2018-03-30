var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 车间工位表
 */
var WorkShopSchema = new Schema({
  wsId: String,                    // 车间号
  wsName: String,                  // 车间名
  eqId: String,                    // 设备号
  eqName: String,                  // 设备名
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  },
  updateDate: {                    // 更新时间
    type: Date,
    default: Date.now
  },
  adder: {                         // 添加人
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  updater: {                       // 更新人
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  }
});

module.exports = mongoose.model('WORK_SHOP', WorkShopSchema);