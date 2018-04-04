var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 产品工序表
 */
var ProdProceSchema = new Schema({
  ppId: {                          // 产品
    type: Schema.Types.ObjectId,
    ref: 'PROD_PROD'
  },
  wp: String,                      // 工序
  wpc: [{                          // 子工序
    key: String,
    value: Number,
    min: Number,
    max: Number
  }],
  eqId: String,                    // 设备编号
  tId: String,                     // 任务号
  index: Number,                   // 工序序号
  time: Number,                    // 工时
  sType: String,                   // 画图类型
  date: Date,                      // 交检日期
  cycle: {                         // 周期
    type: Number,
    default: 0
  },
  qNum: Number,                    // 合格数目
  cNum: Number,                    // 不合格数目
  comment: String,                 // 检验备注
  sValue: [String],                // 自检数值
  cValue: [String],                // 互检数值
  tValue: [String],                // 转检数值
  worker: {                        // 操作员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  checker: {                       // 互检员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  tester: {                        // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  state: {                         // 状态
    type: Number,
    default: 0
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  },
  prodState: {                         // 实际生产状态 0 未使用 1 已绑定仪表 2 硫化中 3 硫化结束 4：自检 5：互检 6：硫化完成
    type: Number,
    default: 0
  },
  selected:{                         // 添加标记
    type: Number,
    default: 0
  }
});
module.exports = mongoose.model('PROD_PROCE', ProdProceSchema);