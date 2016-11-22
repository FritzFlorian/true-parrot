'use strict';

const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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

  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data',
  },

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
    const uploadOptions = {
      photo: {
          title: 'test',
          photo: request.payload.image,
        },
    };

    const maxImageSize = 1000;

    if (request.payload.image) {
      const stream = cloudinary.uploader.upload_stream((result) => {
        createTweet(request.payload.json, result.url, request.params.id, reply);
      }, { width: maxImageSize, height: maxImageSize, crop: 'limit', format: 'jpg' });
      request.payload.image.pipe(stream);
    } else {
      createTweet(request.payload.json, null, request.params.id, reply);
    }
  },
};

function createTweet(tweetJson, tweetImage, userId, reply) {
  let user;

  User.findOne({ _id: userId }).then((dbUser) => {
    user = dbUser;

    if (user) {
      const tweet = Tweet(tweetJson);
      tweet.creator = user._id;
      tweet.image = tweetImage;

      return new tweet.save().then((tweet) => {
        reply(tweet).code(201);
      });
    } else {
      reply(Boom.badRequest('error creating tweet'));
    }
  }).catch((error) => {
    reply(Boom.badImplementation('error creating tweet'));
  });
}

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
