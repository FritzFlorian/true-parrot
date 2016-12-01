'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.dashboard = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    reply('you are an admin');
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
