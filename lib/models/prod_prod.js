var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 生产产品表
 */
var ProdProdSchema = new Schema({
  ppName: String,                  // 产品名称  
  tId: String,                     // 任务号id
  ptId: String,                    // 父任务号id
  mId: String,                     // 产品图号
  eqId: String,                    // 设备编号
  special: String,                 // 任务性质
  cNum: Number,                    // 计划材料数量
  cId: String,                     // 材料牌号
  staTime: Date,                   // 开始时间
  endTime: Date,                   // 结束时间
  planComment: String,             // 计划备注
  planer: {                        // 计划员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  skiller: {                       // 技术员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  dispatcher: {                    // 调度员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  rId: String,                     // 入检批次号
  wp: [{                           // 工序
    sType: String,
    title: String,
    child: [{
      key: String,
      value: Number
    }],
    state:{
      type: Number,
      default: 0
    }
  }],
  files: [{                        // 图纸/文档
    type: Schema.Types.ObjectId,
    ref: 'FILE'
  }],
  times: [Number],                 // 工时
  cwp: String,                     // 报废工序
  qNum: Number,                    // 合格件数
  prodComment: String,             // 产品备注
  checker: {                       // 校对员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  quotaer: {                       // 定额员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },


  grouper: {                       // 班长
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },


  sNum: Number,                    // 实发数量
  state: {                         // 产品状态 初始化为0，产品工艺（材料数量）校验2；产品调度3；产品班组（选择领料员）4； 初步检验完成：10;报废 20
    type: Number,
    default: 0
  },
  picker: {                        // 领料者
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  issuer: {                        // 发料者
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  tester: {                        // 检验员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  },
  mould:[{                           // 模具号
      type: Schema.Types.ObjectId,
      ref: 'MOULD'
  }]
});

module.exports = mongoose.model('PROD_PROD', ProdProdSchema);