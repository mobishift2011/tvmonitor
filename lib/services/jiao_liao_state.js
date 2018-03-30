var JiaoLiaoState = require('../models/jiao_liao_state');

module.exports = {
  save: function (data) {
    return new JiaoLiaoState(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return JiaoLiaoState.find(params)
      .sort({'addDate': -1})
      .populate('jlId')
      .exec()
      .then(list => list.filter(item => !!item.jlId))
  },
  findById: function (id) {
    return JiaoLiaoState.findById(id)
      .populate('jlId')
      .exec();
  },
  update: function (id, data) {
    return JiaoLiaoState.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return JiaoLiaoState.findByIdAndRemove(id);
  }
};