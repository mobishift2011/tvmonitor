var ProceLibrary = require('../models/proce_library');

module.exports = {
  save: function (data) {
    return new ProceLibrary(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return ProceLibrary.find(params)
      .populate('files', '_id name')
      .sort({'addDate': -1})
      .exec();
  },
  findById: function (id) {
    return ProceLibrary.findById(id)
      .populate('files', '_id name')
      .exec();
  },
  update: function (id, data) {
    return ProceLibrary.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return ProceLibrary.findByIdAndRemove(id);
  }
};