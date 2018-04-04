var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 胶料信息表
 */
var JiaoLiaoSchema = new Schema({
  jlName: String,                  // 名称
  jId: String,                     // 存储架号
  total: Number,                   // 库存量
  pId: String,                     // 牌号
  rId: String,                     // 入检批次号
  lId: String,                     // 炉批号
  price: Number,                   // 单价
  skill: String,                   // 技术条件
  produce: String,                 // 生产厂家
  iDate: Date,                     // 入库日期
  kTime: Number,                   // 保证贮存期
  lDate: Date,                     // 检定日期
  dTime: Number,                   // 定检周期
  nDate: Date,                     // 下次检定日期
  mDate: Date,                     // 制造日期
  lTime: Number,                   // 最长贮存期
  jDate: Date,                     // 使用截止日期
  comment: String,                 // 备注
  checked: {                       // 状态
    type: Number,
    default: 0
  },
  state: {                         // 状态
    type: Number,
    default: 0
  },
  adder: {                         // 添加
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  jlKeeper: {                         // 胶料库管理员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  checker: {                       // 校对员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JIAO_LIAO', JiaoLiaoSchema);