var JiaoLiao = require('../models/jiao_liao');

module.exports = {
  save: function (data) {
    return new JiaoLiao(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return JiaoLiao.find(params)
      .sort({'addDate': -1})
      .exec();
  },
  findOne:function (condition) {
    return JiaoLiao.findOne(condition)
      .exec();
  },
  findById: function (id) {
    return JiaoLiao.findById(id)
      .exec();
  },
  update: function (id, data) {
    return JiaoLiao.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  updateByCondition: function (condition, data) {
    return JiaoLiao.update(condition, data).then(() => {
      return JiaoLiao.findOne(condition);
    });
  },
  remove: function (id) {
    return JiaoLiao.findByIdAndRemove(id);
  }
};