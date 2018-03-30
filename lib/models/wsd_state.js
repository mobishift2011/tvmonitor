var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 温湿度设备状态
 */
var WsdSchema = new Schema({
  eqIp: String,
  eqId: Number,
  eqPort:Number,
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  },
  adder: {                         // 添加人
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  readStart:Number,
  readLength:Number,
  connectState:{      //通讯状态 0为未连接 1为连接
    type:Number,
    default:0
  }
});

module.exports = mongoose.model('WSD_STATE', WsdSchema);