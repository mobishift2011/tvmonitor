var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 员工信息表
 */
var WorkUserSchema = new Schema({
  wuId: String,                    // 工号
  password: String,                // 密码
  wuName: String,                  // 名称
  permission: {                    // 权限
    type: Schema.Types.ObjectId,
    ref: 'PERMISSION'
  },
  duty: String,                    // 岗位
  gender: Number,                  // 性别
  flag: Number,                    // 在职
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

module.exports = mongoose.model('WORK_USER', WorkUserSchema);