var S1 = require('../models/s1');

module.exports = {
  save: function (data) {
    return new S1(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  findById: function (id) {
    return S1.findById(id)
      .sort({'date': -1})
      .exec();
  },
  findOne: function (params) {
    return S1.findOne(params)
      .sort({'date': -1})
      .exec();
  },
  find: function (params) {
    return S1.find(params)
      .sort({'date': 1})
      .exec();
  }
};