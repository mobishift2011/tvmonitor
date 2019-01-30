var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 温湿度曲线数据
 */
var WsdDataSchema = new Schema({
    tjxWd:Number,  //涂胶箱 【温度 湿度】
    tjxSd:Number,  //涂胶箱 【温度 湿度】
    jlkWd:Number,  //胶料库
    jlkSd:Number,  //胶料库
    cxj3Wd:Number,  //纯橡胶3号
    cxj3Sd:Number,  //纯橡胶3号
    cxj4Wd:Number,  //纯橡胶4号
    cxj4Sd:Number,  //纯橡胶4号
    cxj5Wd:Number,  //纯橡胶5号
    cxj5Sd:Number,  //纯橡胶5号
    jxj6Wd:Number,  //金橡胶6号
    jxj6Sd:Number,  //金橡胶6号
    jxj7Wd:Number,  //金橡胶7号
    jxj7Sd:Number,  //金橡胶7号
    tjj8Wd:Number,  //涂胶间8号
    tjj8Sd:Number,  //涂胶间8号
    dwxWd:Number,  //低温箱【只有温度】
    sbbs:Number,  //上班标识
    tj1Wd: Number,  //涂胶1【温度 湿度】
    tj1Sd: Number,  //涂胶1 【温度 湿度】
    tj2Wd: Number,  //涂胶2 【温度 湿度】
    tj2Sd: Number,  //涂胶2 【温度 湿度】
    wsdIp:String,
    addDate: {                       // 添加时间
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WSD_DATA', WsdDataSchema);