var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 胶料状态表
 */
var JiaoLiaoStateSchema = new Schema({
  jlId: {                          // 胶料id
    type: Schema.Types.ObjectId,
    ref: 'JIAO_LIAO'
  },
  state: Number,                   // 新状态
  tId: String,                     // 任务号
  cId: String,                     // 材料牌号
  mId: String,                     // 产品图号
  picker: {                        // 领料员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  num: Number,
  lDate: Date,
  cDate: Date,
  reason: String,
  adder: {                         // 发料员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  addDate: {                       // 时间
    type: Date,
    default: Date.now
  },
  checked: {                       // 检验员确认状态
    type: Number,
    default: 0
  },
  checker: {                       // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  jlKeeper: {                         // 胶料库管理员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  }
});

module.exports = mongoose.model('JIAO_LIAO_STATE', JiaoLiaoStateSchema);