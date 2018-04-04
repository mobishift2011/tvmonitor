var User = require('../models/user');

module.exports = {
  save: function (data) {
    return new User(data).save();
  },
  find: function (params) {
    return User.find(params)
      .sort({'updateDate': -1})
      .exec();
  },
  findById: function (id) {
    return User.findById(id)
      .exec();
  },
  update: function (id, data) {
    return User.update({_id: id}, data).then(()=> {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return User.findByIdAndRemove(id);
  },
  valid: function (data) {
    if (!data.username || !data.username.trim()) {
      return '请输入用户名';
    }

    if (!/^[0-9a-zA-Z]{6,15}$/.exec(data.username)) {
      return '用户名格式错误';
    }

    if (!data.password || !data.password.trim()) {
      return '请输入密码';
    }

    if (!/^[0-9a-zA-Z]{6,15}$/.exec(data.password)) {
      return '密码格式错误';
    }

    if (!data.permission) {
      return '请选择权限';
    }

    return '';
  }
};