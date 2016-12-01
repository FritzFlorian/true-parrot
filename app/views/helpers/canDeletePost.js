'use strict';

const _ = require('lodash');

const canDeletePost = function (creator, context) {
  if (_.includes(context.data.root.scope, 'admin') || context.data.root.userId == creator._id) {
    return context.fn(this);
  }

  return context.inverse(this);
};

module.exports = canDeletePost;
