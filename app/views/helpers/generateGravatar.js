'use strict';

const gravatar = require('gravatar');

const generateGravatar = function (email, context) {
  return gravatar.url(email);
};

module.exports = generateGravatar;
