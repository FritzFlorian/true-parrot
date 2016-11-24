'use strict';

const gravatar = require('gravatar');

const generateGravatar = function (email, size, context) {
  const options = {}
  if (context) {
    options.s = size;
  } else {
    context = size;
  }

  return gravatar.url(email, options);
};

module.exports = generateGravatar;
