var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 平板硫化机设备状态
 */
var PblhjStateSchema = new Schema({
    eqId: String,                    // 设备ID
    eqIp:String,
    eqPort:Number,
    tIds: [String],                  // 任务号
    pqyl: Number, //排气压力
    pqcs: Number, //排气次数
    swsj: Number, //升温时间
    swbcz: Number, //升温补偿值
    swjxz: Number, //升温极限值
    lhsj: Number, //硫化时间
    lhyl: Number, //硫化压力
    lhylcz: Number, //硫化压力差值
    lhwd: Number, //硫化温度
    lhwdzdz: Number, //硫化温度最大值
    lhwdzxz: Number, //硫化温度最小值
    firstTask: Schema.Types.Mixed,  //一号任务
    secondTask: Schema.Types.Mixed, //二号任务
    thirdTask: Schema.Types.Mixed,  //三号任务
    fourthTask: Schema.Types.Mixed,  //四号任务
    state: {                         // 状态：0空闲 1使用中 2：修改任务号
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
    picker: {                         // 操作员
        type: Schema.Types.ObjectId,
        ref: 'WORK_USER'
    },
    readStart:Number,
    readLength:Number,
    writeStart:Number,
    connectState:{      //通讯状态 0为未连接 1为连接
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('1PBLHJ_STATE', PblhjStateSchema);
