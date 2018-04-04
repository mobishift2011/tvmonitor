var HxStateData = require('../models/hx_state_data');

module.exports = {
  save: function (data) {
    return new HxStateData(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params,populate) {
    return HxStateData.find(params)
        .populate(populate)
      .sort({'addDate': 1})
      .exec();
  },
  findLast: function (params,populate) {
    return HxStateData.find(params)
        .populate(populate)
        .sort({'addDate': -1})
        .limit(1)
        .exec();
  },
  findById: function (id) {
    return HxStateData.findById(id)
      .exec();
  },
  update: function (id, data) {
    return HxStateData.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return HxStateData.findByIdAndRemove(id);
  },
  findLastData: function (params) {
      return HxStateData.find(params)
          .sort({'addDate': -1})
          .limit(1)
          .exec();
  }
};