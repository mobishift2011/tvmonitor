var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 生产产品表
 */
var ProceLibrarySchema = new Schema({
  mId: String,                     // 产品图号
  ppName: String,                  // 产品名称
  cId: String,                     // 材料牌号
  wp: [{                           // 工序
    sType: String,
    title: String,
    child: [{
      key: String,
      value: Number,
      // 根据需求取消最大最小值
      // min: Number,
      // max: Number
    }]
  }],
  files: [{                        // 图纸/文档
    type: Schema.Types.ObjectId,
    ref: 'FILE'
  }],
  times: [Number],                 // 工时 定额
  usage: {                         // 使用状态
    type: Number,
    default: 1
  },
  state: {                         // 状态 初始为0；校对通过1；定额通过2；工艺主管通过3
    type: Number,
    default: 0
  },
  skiller: {                       // 技术员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  checker: {                       // 校对员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  quotaer: {                       // 定额员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  manager: {                       // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PROCE_LIBRARY', ProceLibrarySchema);