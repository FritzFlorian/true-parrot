'use strict';

const Boom = require('boom');
const User = require('../models/user');

const utils = require('./utils.js');
const _ = require('lodash');

exports.deleteMultipleTweets = {
  auth: {
    strategy: 'jwt',
    scope: 'admin',
  },

  handler: function (request, reply) {

  },
};

exports.deleteMultipleUsers = {
  auth: {
    strategy: 'jwt',
    scope: 'admin',
  },

  handler: function (request, reply) {

  },
};
