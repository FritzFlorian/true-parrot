'use strict';

const Boom = require('boom');

// Samples:
// reply(Boom.badImplementation('error accessing db'));
// reply(Boom.notFound('id not found'));
// reply(Boom.badImplementation('error creating model'));

exports.find = {
  auth: false,

  handler: function (request, reply) {
    reply({ key: 'value' });
  },
};

