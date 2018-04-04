var HxState = require('../models/hx_state');

module.exports = {
  save: function (data) {
    return new HxState(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return HxState.find(params)
      .exec();
  },
  findById: function (id) {
    return HxState.findById(id)
      .exec();
  },
  update: function (id, data) {
    return HxState.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return HxState.findByIdAndRemove(id);
  }
};