var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 权限表
 */
var PermissionSchema = new Schema({
  name: String,                    // 名称
  paths: [String],                 // 路径
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

module.exports = mongoose.model('PERMISSION', PermissionSchema);