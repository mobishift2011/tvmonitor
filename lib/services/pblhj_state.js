var PblhjState = require('../models/pblhj_state');

module.exports = {
  save: function (data) {
    return new PblhjState(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return PblhjState.find(params)
      .sort({'addDate': -1})
      .exec();
  },
  findById: function (id) {
    return PblhjState.findById(id)
      .exec();
  },
  update: function (id, data) {
    return PblhjState.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return PblhjState.findByIdAndRemove(id);
  }
};
