'use strict';

const moment = require('moment');

const timeAgo = function (date, context) {
  return moment(date).fromNow();
};

module.exports = timeAgo;
