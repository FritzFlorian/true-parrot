'use strict';

const _ = require('lodash');

const isAdmin = function (context) {
  if (_.includes(context.data.root.scope, 'admin')) {
    return context.fn(this);
  }

  return context.inverse(this);
};

module.exports = isAdmin;
