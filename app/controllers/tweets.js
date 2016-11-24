'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.showAll = {
  auth: {
    mode: 'try',
    strategy: 'session',
  },
  handler: function (request, reply) {
    Tweet
    .find({})
    .sort({ createdAt: 'desc' })
    .limit(50)
    .populate('creator')
    .exec().then((tweets) => {
      reply.view('allTweets', { tweets: tweets });
    }).catch((error) => {
      reply.redirect('/');
    });
  },
};

exports.form = {
  handler: function (request, reply) {
    reply.view('createTweet');
  },
};

exports.create = {
  validate: {

    payload: Tweet.webValidationSchema,

    failAction: function (request, reply, source, error) {
      reply.view('createTweet', {
        title: 'Tweet creation error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data',
  },

  handler: function (request, reply) {
    const image = request.payload.image;
    if (image && image._data && image._data.length > 0) {
      const stream = cloudinary.uploader.upload_stream((result) => {
        createTweet(request.payload.message, result.url, request.auth.credentials.loggedInUserId, reply);
      }, Tweet.cropOptions);
      request.payload.image.pipe(stream);
    } else {
      createTweet(request.payload.message, null, request.auth.credentials.loggedInUserId, reply);
    }
  },
};

function createTweet(message, tweetImage, userId, reply) {
  let user;

  User.findOne({ _id: userId }).then((dbUser) => {
    user = dbUser;

    if (user) {
      const tweet = Tweet({ message: message });
      tweet.creator = user._id;
      tweet.image = tweetImage;

      return new tweet.save().then((tweet) => {
        reply.redirect('/users/' + user._id);
      });
    } else {
      reply.redirect('/');
    }
  }).catch((error) => {
    reply.redirect('/');
  });
}

exports.deleteOne = {
  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).then((tweet) => {
      if (tweet && tweet.creator == request.auth.credentials.loggedInUserId) {
        tweet.remove();
        reply().redirect('/users/' + request.auth.credentials.loggedInUserId);
      } else {
        reply.redirect('/');
      }
    }).catch((error) => {
      reply.redirect('/');
    });
  },
}
