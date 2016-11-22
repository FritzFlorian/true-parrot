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

  validate: {
    payload: User.validationSchema,

    failAction: function (request, reply, source, error) {
      const boomError = Boom.badRequest('Validation Failed.');
      boomError.output.payload.validation_errors = error.data.details;
      reply(boomError);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const user = new User(request.payload);

    user.save().then((newUser) => {
      reply(newUser).code(201);
    }).catch((error) => {
      reply(Boom.badImplementation('error creating user'));
    });
  },
};

exports.update = {
  auth: false,

  validate: {
    payload: User.updateApiValidationSchema,

    failAction: function (request, reply, source, error) {
      const boomError = Boom.badRequest('Validation Failed.');
      boomError.output.payload.validation_errors = error.data.details;
      reply(boomError);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    User.findByIdAndUpdate({ _id: request.params.id },  { $set: request.payload }, { new: true })
    .then((user) => {
      reply(user).code(200);
    }).catch((error) => {
      reply(Boom.badImplementation('error updating user'));
    });
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
