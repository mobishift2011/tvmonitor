var mongoose = require('./mongoose');
var Schema = mongoose.Schema;

/**
 * 员工信息表
 */
var AuthTokenSchema = new Schema({
    token: String,                    // token
    addDate: {                       // 添加时间
        type: Date,
        default: Date.now
    },
    user: {                         // token用户
        type: Schema.Types.ObjectId,
        ref: 'WORK_USER'
    }
});

module.exports = mongoose.model('AUTH_TOKEN', AuthTokenSchema);