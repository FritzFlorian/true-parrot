'use strict';

exports.dashboard = {
  auth: {
    scope: 'admin',
  },

  handler: function (request, reply) {
    reply('you are an admin');
  },
};
