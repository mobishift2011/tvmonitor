var File = require('../models/file');

module.exports = {
  save: function (data) {
    return new File(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  findById: function (id) {
    return File.findById(id)
      .select({_id: 1, name: 1, type: 1, size: 1})
      .exec();
  },
  getDataById: function (id) {
    return File.findById(id)
      .select({_id: 1, name: 1, type: 1, size: 1, data: 1})
      .exec();
  },
  update: function (id, data) {
    return File.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return File.findByIdAndRemove(id);
  }
};