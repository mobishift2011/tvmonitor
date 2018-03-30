var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 模具信息表
 */
var MouldSchema = new Schema({
  moldId: String,                  // 模架号
  mId: String,                     // 模具号
  mName: String,                   // 模具名
  mapId: String,                   // 产品图号
  shape: String,                   // 形状
  sSize: String,                   // 标准尺寸
  size: String,                    // 产品尺寸
  rubber: String,                  // 使用胶料
  mNum: Number,                    // 模具数量
  cNum: Number,                    // 模腔数量
  ccNum: Number,                   // 可用模腔数量
  state: {                         // 模具状态
    type: Number,
    default: 0
  },
  checkState: {                    // 审核状态
    type: Number,
    default: 0
  },
  total: {                         // 累计产量
    type: Number,
    default: 0
  },
  checker: {                       // 校对员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  tester: {                        // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  adder: {                         // 模具库管理员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MOULD', MouldSchema);