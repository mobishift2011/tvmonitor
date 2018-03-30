var S2 = require('../models/s2');

module.exports = {
  save: function (data) {
    return new S2(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  findById: function (id) {
    return S2.findById(id)
      .exec();
  },
  find: function (params) {
    return S2.find(params)
      .sort({'date': 1})
      .exec();
  }
};