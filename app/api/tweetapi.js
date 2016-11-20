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
    .populate('creator')
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
    Tweet.find({ creator: request.params.id })
    .sort({ createdAt: 'desc' })
    .limit(50)
    .populate('creator')
    .exec().then((tweets) => {
      reply(tweets);
    }).catch((error) => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },
};

exports.findOne = {
  auth: false,

  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).populate('creator').exec().then((tweet) => {
      if (tweet) {
        reply(tweet);
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
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
    Tweet.remove({ _id: request.params.id }).then((tweet) => {
      reply().code(204);
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};
