var MouldState = require('../models/mould_state');

module.exports = {
  save: function (data) {
    return new MouldState(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return MouldState.find(params)
      .sort({'time': -1})
      .populate('mId')
      .exec()
      .then(list => list.filter(item => item.mId));
  },
  findById: function (id) {
    return MouldState.findById(id)
      .populate({
        path: 'mId',
        model: 'MOULD',
        populate: {
          path: 'ppId',
          model: 'PROD_PROD'
        }
      })
      .exec();
  },
  update: function (id, data) {
    return MouldState.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return MouldState.findByIdAndRemove(id);
  }
};