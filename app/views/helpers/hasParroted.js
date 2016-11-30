'use strict';

const hasParroted = function (tweet, context) {
  let hasParroted = false;

  tweet.parroting.forEach((userId) => {
    if (userId.equals(context.data.root.userId)) {
      hasParroted = true;
    }
  });

  if (hasParroted) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

module.exports = hasParroted;
