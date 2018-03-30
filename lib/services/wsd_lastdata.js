var WsdStateData = require('../models/wsd_lastdata');

module.exports = {
save: function (data) {
return new WsdStateData(data).save()
.then((data) => {
return this.findById(data._id);
});
},
find: function (params) {
return WsdStateData.find(params)
//.sort({'addDate': -1})
.exec();
},
findLast: function (params) {
return WsdStateData.find(params)
.sort({'addDate': -1})
.limit(1)
.exec();
},
findById: function (id) {
return WsdStateData.findById(id)
.exec();
},
update: function (id, data) {
return WsdStateData.update({_id: id}, data).then(() => {
return this.findById(id);
});
},
remove: function (id) {
return WsdStateData.findByIdAndRemove(id);
}
};