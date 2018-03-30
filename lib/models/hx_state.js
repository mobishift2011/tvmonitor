var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 烘箱设备状态
 */
var HxSchema = new Schema({
  eqId: Number,                    // 设备ID
  eqIp:String,
  eqPort:Number,
  tIds: [{    // 任务号
    tId: String,
    selected: { type: Number, default: 0 } //标记任务号已选，防止重复选择
  }],                  
  wd: [Number],                    // 温度
  sj: [Number],                    // 时间
  picker: {                         // 操作员
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  state: {                         // 状态 0空闲 1使用中
    type: Number,
    default: 0
  },
  addDate: {                       // 添加时间
    type: Date,
    default: Date.now
  },
  adder: {                         // 添加人
    type: Schema.Types.ObjectId,
    ref: 'WORK_USER'
  },
  ybName:String,       //仪表名称
  ybCode:Number,         //仪表码
  readStart:Number,
  readLength:Number,
  writeStart:Number,
  connectState:{      //通讯状态 0为未连接 1为连接
    type:Number,
    default:0
  },
    writeTIdStart:Number   //开始写入任务号地址
});

module.exports = mongoose.model('HX_STATE', HxSchema);