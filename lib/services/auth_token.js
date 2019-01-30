var AuthToken = require('../models/auth_token');

module.exports = {
    save: function (data) {
        return new AuthToken(data).save()
            .then((data) => {
                return data;
            });
    },
    find: function (params) {
        return AuthToken.find(params).exec();
    },
    findByUser: function (user) {
        return this.find({ user: user });
    },
    remove: function (params) {
        return AuthToken.find(params).remove().then(() => { });
    }
};