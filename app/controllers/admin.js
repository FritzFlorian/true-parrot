'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const moment = require('moment');

exports.dashboard = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    let tweets;
    let tweetCount;
    let userCount;
    let tweetsPerDay;

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

      const startDate = moment().startOf('day').subtract(7, 'days').toDate();
      const endDate = moment().toDate();

      return Tweet
      .aggregate([
        { // Match Stage
          $match: { createdAt: { $lt: endDate, $gte: startDate } },
        },
        { // Aggregate Stage
          $group: {
            _id: {
              day: { $dayOfMonth: '$createdAt' },
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]).exec();
    }).then((dbTweetsPerDay) => {
      tweetsPerDay = dbTweetsPerDay.sort((a, b) => {
        const yearDiff = a._id.year - b._id.year;
        const monthDiff = a._id.month - b._id.month;
        const dayDiff = a._id.day - b._id.day;

        return 10000 * yearDiff + 100 * monthDiff + dayDiff;
      });

      return User.find({}).sort({ createdAt: 'desc' }).limit(5).exec();
    }).then((users) => {
      reply.view('adminDashboard', {
            users: users,
            tweets: tweets,
            userCount: userCount,
            tweetCount: tweetCount,
            tweetsPerDay: tweetsPerDay,
          });
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
    User.find({}).then((users) => {
      reply.view('adminUsers', { users: users });
    }).catch((error) => {
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/admin/dashboard');
    });
  },
};

exports.listTweets = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    Tweet.find({}).then((tweets) => {
      reply.view('adminTweets', { tweets: tweets });
    }).catch((error) => {
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/admin/dashboard');
    });
  },
};
