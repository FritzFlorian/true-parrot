'use strict';

const Joi = require('joi');

exports.main = {
  auth: {
    mode: 'try',
    strategy: 'session',
  },
  plugins: {
    'hapi-auth-cookie': {
      redirectTo: false,
    },
  },
  handler: function (request, reply) {
    reply.view('main', { title: 'Welcome to True Parrot' });
  },

};
