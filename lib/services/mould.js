var Mould = require('../models/mould');

module.exports = {
  save: function (data) {
    return new Mould(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return Mould.find(params)
      .sort({'addDate': -1})
      .populate('ppId')
      .exec();
  },
  findById: function (id) {
    return Mould.findById(id)
      .populate('ppId')
      .exec();
  },
  updateById: function (id, data) {
    return Mould.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  update: function (condition, data) {
    return Mould.update(condition, data);
  },
  remove: function (id) {
    return Mould.findByIdAndRemove(id);
  }
};