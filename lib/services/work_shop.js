var WorkShop = require('../models/work_shop');

module.exports = {
  save: function (data) {
    return new WorkShop(data).save()
      .then((data) => {
        return this.findById(data._id);
      });
  },
  find: function (params) {
    return WorkShop.find(params)
      .sort({'updateDate': -1})
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  findById: function (id) {
    return WorkShop.findById(id)
      .populate('adder', '-password')
      .populate('updater', '-password')
      .exec();
  },
  update: function (id, data) {
    return WorkShop.update({_id: id}, data).then(() => {
      return this.findById(id);
    });
  },
  remove: function (id) {
    return WorkShop.findByIdAndRemove(id);
  },
  valid: function (data) {
    if (!data.wsId || !data.wsId.trim()) {
      return '请输入车间编号';
    }

    if (!data.wsName || !data.wsName.trim()) {
      return '请输入车间名称';
    }

    if (!data.wpId || !data.wpId.trim()) {
      return '请输入工位编号';
    }

    if (!data.wpName || !data.wpName.trim()) {
      return '请输入工位名称';
    }

    if (!data.wpPlace || !data.wpPlace.trim()) {
      return '请输入工位位置';
    }

    if (!data.eqId || !data.eqId.trim()) {
      return '请输入设备编号';
    }

    if (!data.eqName || !data.eqName.trim()) {
      return '请输入设备名称';
    }

    return '';
  }
};