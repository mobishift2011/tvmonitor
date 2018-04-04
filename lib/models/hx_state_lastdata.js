var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 烘箱设备最后数据
 */
var HxDataSchema = new Schema({
    ycOrbd:Number,  //远程/本地
    sdOrzd:Number,  //手动/自动
    wd1:Number,  //温度1
    wd2:Number,  //温度2
    wd3:Number,  //温度3
    wd4:Number,  //温度4
    cxyxd:Number,  //程序运行段1
    qtbs:Number,  //启停1标示
    ybtxzt:Number,  //仪表1通讯状态
    hxmzt:Number,  //烘箱1门状态
    ssyxsj:Number,  //实时1运行时间
    zsj:Number,  //总1的时间
    lhjd:Number, //硫化进度
    startTime:Number, //开始时间
    endTime:Number, //结束时间
    //czzgh:Number,  //操作者工号1
    //hxIp:String,  //烘箱ip
    //hxId:String,  //烘箱id
    wuId: String,                    // 工号
    tIds: [String],
    addDate: {                       // 添加时间
        type: Date,
        default: Date.now
    },
    isLine:Number,   //是否是曲线
    hxState:{
        type: Schema.Types.ObjectId,
        ref: 'HX_STATE'
    }
});

module.exports = mongoose.model('HX_STATE_LASTDATA', HxDataSchema);