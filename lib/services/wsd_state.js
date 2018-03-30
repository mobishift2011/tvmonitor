var WsdState = require('../models/wsd_state');

module.exports = {
  find: function (params) {
    return WsdState.find(params)
      .exec();
  },
  findById: function (id) {
    return WsdState.findById(id)
        .exec();
  },
  update: function (id, data) {
    return WsdState.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  }
};