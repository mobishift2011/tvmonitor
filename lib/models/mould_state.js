var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 模具状态表
 */
var MouldStateSchema = new Schema({
  mId: {                           // 模具号
    type: Schema.Types.ObjectId,
    ref: 'MOULD'
  },
  oldState: Number,                // 模具老状态
  state: Number,                   // 模具状态
  tId: String,                     // 任务号
  time: {                          // 时间
    type: Date,
    default: Date.now
  },
  checked: {                       // 检验员确认状态 1待确认 2确认 3拒绝
    type: Number,
    default: 1
  },
  checker: {                       // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  applyer: {                       // 申请人
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  }
});

module.exports = mongoose.model('MOULD_STATE', MouldStateSchema);