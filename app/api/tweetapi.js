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

const _ = require('lodash');

exports.findAll = {
  auth: false,

  handler: function (request, reply) {
    Tweet.find({})
    .sort({ createdAt: 'desc' })
    .limit(50)
    .populate('creator')
    .exec().then((tweets) => {
      tweets.map((tweet) => {
        delete tweet.creator._doc.password;
        return tweet;
      });
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
      tweets.map((tweet) => {
        delete tweet.creator._doc.password;
        return tweet;
      });

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
        delete tweet.creator._doc.password;
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
  auth: {
    strategy: 'jwt',
  },

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

    const userInfo = request.auth.credentials;

    if (request.payload.image) {
      const stream = cloudinary.uploader.upload_stream((result) => {
        createTweet(request.payload.json, result.url, userInfo.id, reply);
      }, Tweet.cropOptions);
      request.payload.image.pipe(stream);
    } else {
      createTweet(request.payload.json, null, userInfo.id, reply);
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
  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const userInfo = request.auth.credentials;

    Tweet.findOne({ _id: request.params.id }).then((tweet) => {
      if (tweet) {
        if (tweet.creator.equals(userInfo.id) || _.includes(userInfo.scope, 'admin')) {
          tweet.remove();
          reply().code(204);
        } else {
          reply(Boom.forbidden('insufficient permissions'));
        }
      } else {
        reply(Boom.notFound('id not found'));
      }
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};

exports.parrotOne = {
  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    let alreadyParroting = false;

    Tweet.findOne({ _id: request.params.id }).then((tweet) => {
      if (tweet) {
        // Delete existing parroting of user
        let newParrotings = tweet.parroting.filter((currentId) => {
          if (currentId.equals(request.auth.credentials.id)) {
            return false;
          }

          return true;
        });

        // Re-Add the parrot if the user patches to set parroting to true
        if (request.payload.parroting) {
          newParrotings.push(request.auth.credentials.id);
        }

        tweet.parroting = newParrotings;
        return tweet.save();
      } else {
        throw 'id not found';
      }
    }).then((newTweet) => {
      reply(newTweet).code(200);
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};
