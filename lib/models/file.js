var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 文件
 */
var FileSchema = new Schema({
  name: String,                   // 文件名
  type: String,                   // 文件类型
  data: Buffer,                   // 文件内容
  size: Number,                   // 文件大小
  date: {                         // 上传日期
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  }
});

module.exports = mongoose.model('FILE', FileSchema);