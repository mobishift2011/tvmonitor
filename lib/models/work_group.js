var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 工作班组表
 */
var WorkGroupSchema = new Schema({
  wgId: String,                    // 班组号
  wgName: String,                  // 班组名
  wsId: {                          // 车间
    type: Schema.Types.ObjectId,
    ref: 'WORK_SHOP'
  },
  wus: [{                          // 员工
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  }],
  grouper: {                       // 班长
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
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

module.exports = mongoose.model('WORK_GROUP', WorkGroupSchema);