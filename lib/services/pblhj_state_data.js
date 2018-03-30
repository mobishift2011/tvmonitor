var PblhjStateData = require('../models/pblhj_state_data');

module.exports = {
  save: function (data) {
    return new PblhjStateData(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params,populate, filter) {
    return PblhjStateData.find(params, filter)
      .populate(populate)
      .sort({'addDate': 1})
      .exec();
  },
  findLast: function (params,populate) {
    return PblhjStateData.find(params)
        .populate(populate)
        .sort({'addDate': -1})
        .limit(1)
        .exec();
  },
  findById: function (id) {
    return PblhjStateData.findById(id)
      .exec();
  },
  update: function (id, data) {
    return PblhjStateData.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return PblhjStateData.findByIdAndRemove(id);
  },
    findLastData: function (params) {
        return PblhjStateData.find(params)
            .sort({'addDate': -1})
            .limit(1)
            .exec();
    }
};
