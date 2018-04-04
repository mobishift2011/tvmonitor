var WorkGroup = require('../models/work_group');

module.exports = {
  save: function (data) {
    return new WorkGroup(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return WorkGroup.find(params)
      .sort({'updateDate': -1})
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  findById: function (id) {
    return WorkGroup.findById(id)
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  update: function (id, data) {
    return WorkGroup.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return WorkGroup.findByIdAndRemove(id);
  }
};