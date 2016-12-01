'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.dashboard = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    let tweets;
    let tweetCount;
    let userCount;

    Tweet
    .find({})
    .sort({ createdAt: 'desc' })
    .limit(5)
    .populate('creator')
    .exec()
    .then((dbTweets) => {
      tweets = dbTweets;

      return Tweet.count({});
    }).then((dbTweetCount) => {
      tweetCount = dbTweetCount;

      return User.count({});
    }).then((dbUserCount) => {
      userCount = dbUserCount;

      return User.find({}).sort({ createdAt: 'desc' }).limit(5).exec();
    }).then((users) => {
      reply.view('adminDashboard',
                  { users: users, tweets: tweets, userCount: userCount, tweetCount: tweetCount });
    }).catch((error) => {
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/tweets');
    });
  },
};

exports.deleteSingleUser = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    User
    .remove({ _id: request.params.id })
    .then(user => Tweet.remove({ creator: request.params.id }))
    .then((tweets) => {
      request.yar.flash('info', ['Deleted user.'], true);
      reply.redirect('/admin/users');
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};

exports.listUsers = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    reply('admin user list');
  },
};
