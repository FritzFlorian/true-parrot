'use strict';

const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.findAll = {
  auth: false,

  handler: function (request, reply) {
    Tweet.find({})
    .sort({ createdAt: 'desc' })
    .limit(50)
    .exec().then((tweets) => {
      reply(tweets);
    }).catch((error) => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },
};

exports.findAllByUser = {
  auth: false,

  handler: function (request, reply) {

  },
};

exports.findOne = {
  auth: false,

  handler: function (request, reply) {

  },
};

exports.create = {
  auth: false,

  handler: function (request, reply) {

  },
};

exports.deleteOne = {
  auth: false,

  handler: function (request, reply) {

  },
};
