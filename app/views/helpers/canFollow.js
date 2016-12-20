'use strict';

const _ = require('lodash');

const canFollow = function (user, context) {
  if (_.includes(user.followers, context.data.root.userId)
        || context.data.root.userId == user._id) {
    return context.inverse(this);
  }

  return context.fn(this);
};

module.exports = canFollow;
