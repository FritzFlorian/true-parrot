'use strict';

const Tweet = require('../models/tweet');

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
}
