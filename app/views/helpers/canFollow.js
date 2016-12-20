'use strict';

const _ = require('lodash');

const canFollow = function (user, context) {
  const followerStrings = user.followers.map(user => JSON.parse(JSON.stringify(user)));

  if (_.includes(followerStrings, context.data.root.userId)
        || context.data.root.userId == user._id) {
    return context.inverse(this);
  }

  return context.fn(this);
};

module.exports = canFollow;
