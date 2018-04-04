var WorkUser = require('../models/work_user');
var admin = require('../../global.json').admin;

module.exports = {
  save: function (data) {
    if (!data.permission) data.permission = null;
    return new WorkUser(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  findField: function () {
    return WorkUser
        .find({wuId: {$ne: admin.wuId}})
        .select({wuName: 1, _id: 1,permission: 1})
        .populate('permission')
        .exec();
  },
  find: function (params) {
    return WorkUser.find(params)
      .sort({'updateDate': -1})
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  findById: function (id) {
    return WorkUser.findById(id)
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  update: function (id, data) {
    if (!data.permission) data.permission = null;
    return WorkUser.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return WorkUser.findByIdAndRemove(id);
  },
  valid: function (data) {
    if (!data.wuId || !data.wuId.trim()) {
      return '请输入员工工号';
    }

    if (!/^[0-9a-zA-Z]{1,15}$/.exec(data.wuId)) {
      return '工号格式错误';
    }

    if (!data.password || !data.password.trim()) {
      return '请输入登陆密码';
    }

    if (!/^[0-9a-zA-Z]{1,15}$/.exec(data.password)) {
      return '密码格式错误';
    }

    if (!data.wuName || !data.wuName.trim()) {
      return '请输入员工名称';
    }

    // if (!data.duty || !data.duty.trim()) {
    //   return '请输入员工岗位';
    // }

    if (typeof(parseFloat(data.gender)) !== 'number') {
      return '请选择员工性别';
    }

    return '';
  }
};