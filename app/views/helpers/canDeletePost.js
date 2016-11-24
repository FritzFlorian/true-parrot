'use strict';

const canDeletePost = function (creator, context) {
  if (context.data.root.userId == creator._id) {
    return context.fn(this);
  }

  return context.inverse(this);
};

module.exports = canDeletePost;
