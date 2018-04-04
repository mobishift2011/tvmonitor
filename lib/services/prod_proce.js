var _ = require('lodash');
var ProdProce = require('../models/prod_proce');

module.exports = {
  save: function (data) {
    return new ProdProce(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return ProdProce.find(params)
      .sort({addDate: -1, index: 1})
      .populate('ppId')
      .exec()
      .then(function (list) {
        return list.filter(item => item.ppId);
      });
  },
  findOne: function (params) {
    return ProdProce.findOne(params)
      .exec();
  },
  findById: function (id) {
    return ProdProce.findById(id)
      .populate('ppId')
      .exec();
  },
  update: function (id, data) {
    return ProdProce.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  // updateByCondition: function (condition, data) {
  //   return ProdProce.update(condition, data);
  // },
  updateByCondition: function () {
    return ProdProce.update(...arguments);
  },
  remove: function (id) {
    return ProdProce.findByIdAndRemove(id);
  }
};