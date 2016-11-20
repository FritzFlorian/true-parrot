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

  validate: {
    payload: Tweet.validationSchema,

    failAction: function (request, reply, source, error) {
      const boomError = Boom.badRequest('Validation Failed.');
      boomError.output.payload.validation_errors = error.data.details;
      reply(boomError);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    let user;

    User.findOne({ _id: request.params.id }).then((dbUser) => {
      user = dbUser;

      if (user) {
        const tweet = Tweet(request.payload);
        tweet.creator = user._id;

        return new tweet.save().then((tweet) => {
          reply(tweet).code(201);
        });
      } else {
        reply(Boom.badRequest('error creating tweet'));
      }
    }).catch((error) => {
      reply(Boom.badImplementation('error creating tweet'));
    });
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
