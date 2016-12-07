'use strict';

const Boom = require('boom');
const User = require('../models/user');
const Tweet = require('../models/tweet');

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
    const usersToDelete = request.payload;
    let usersDeleted;

    User.remove({ _id: { $in: usersToDelete } }).then((users) => {
      usersDeleted = users.result.n;
      return Tweet.remove({ creator: { $in: usersToDelete } });
    }).then((tweets) => {
      const message = 'Deleted ' + usersDeleted + ' users and ' +
          tweets.result.n + ' related tweets.';

      reply({ success: true, message: message }).code(204);
    }).catch((error) => {
      reply(Boom.badImplementation('error deleting users'));
    });
  },
};
