var Permission = require('../models/permission');

module.exports = {
  save: function (data) {
    return new Permission(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return Permission.find(params)
      .sort({'updateDate': -1})
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  findById: function (id) {
    return Permission.findById(id)
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  update: function (id, data) {
    return Permission.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return Permission.findByIdAndRemove(id);
  },
  valid: function (data) {
    if (!data.name || !data.name.trim()) {
      return '请输入权限名称';
    }

    if (!data.paths || !data.paths.length) {
      return '请选择权限菜单';
    }

    return '';
  }
};