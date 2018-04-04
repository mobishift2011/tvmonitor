var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 平板硫化机设备数据
 */
var PblhjStateLASTDataSchema = new Schema({
    wd1:Number,
    wd2:Number,
    wd3:Number,
    wd4:Number,
    wuId: String,                    // 工号
    firstTask:{ 
        bhgcl: String,
        hgcl: String,
        zcl: String,
        mczs: String,
        mch: String,
        yxmqs: String,
        cpth: String,
        mjh: String,
        tId: String 
      },  //一号任务
    secondTask:{ 
        bhgcl: String,
        hgcl: String,
        zcl: String,
        mczs: String,
        mch: String,
        yxmqs: String,
        cpth: String,
        mjh: String,
        tId: String 
      }, //二号任务
    thirdTask:{ 
        bhgcl: String,
        hgcl: String,
        zcl: String,
        mczs: String,
        mch: String,
        yxmqs: String,
        cpth: String,
        mjh: String,
        tId: String 
      },  //三号任务
    fourthTask:{ 
        bhgcl: String,
        hgcl: String,
        zcl: String,
        mczs: String,
        mch: String,
        yxmqs: String,
        cpth: String,
        mjh: String,
        tId: String 
      },  //四号任务
    lhyl:Number,  //硫化压力
    lhsssj:Number,  //硫化实时时间
    swsssj:Number,  //升温实时时间
    lhbz:Number,  //硫化标志
    bdkz:Number,  //本地控制
    swsjcc:Number,  //升温时间超差
    ylcc:Number,  //压力超差
    wdcc:Number,  //温度超差
    firstUse:Number,
    secondUse:Number,
    thirdUse:Number,
    fourthUse:Number,
    addDate: {                       // 添加时间
        type: Date,
        default: Date.now
    },
    isLine:Number ,  //是否是曲线
    lhjState:{
        type: Schema.Types.ObjectId,
        ref: 'PBLHJ_STATE'
    }
});

module.exports = mongoose.model('PBLHJ_STATE_LASTDATA', PblhjStateLASTDataSchema);