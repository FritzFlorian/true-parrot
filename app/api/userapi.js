'use strict';

const Boom = require('boom');
const User = require('../models/user');

exports.findAll = {
  auth: false,

  handler: function (request, reply) {
    User.find({}).then((users) => {
      reply(users);
    }).catch((error) => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },
};

exports.findOne = {
  auth: false,

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then((user) => {
      if (user == null) {
        reply(Boom.notFound('id not found'));
      } else {
        reply(user);
      }
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};

exports.create = {
  auth: false,

  handler: function (request, reply) {

  },
};

exports.update = {
  auth: false,

  handler: function (request, repyl) {

  },
};

exports.deleteOne = {
  auth: false,

  handler: function (request, reply) {
    User.remove({ _id: request.params.id }).then((user) => {
      reply().code(204);
    }).catch((error) => {
      reply(Boom.notFound('id not found'));
    });
  },
};
