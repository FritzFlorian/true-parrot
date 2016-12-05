'use strict';

const Boom = require('boom');
const User = require('../models/user');

const utils = require('./utils.js');
const _ = require('lodash');

exports.authenticate = {
  auth: false,
  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        const token = utils.createToken(foundUser);
        delete foundUser._doc.password;

        reply({ success: true, token: token, user: foundUser }).code(201);
      } else {
        reply({ success: false, message: 'Authentication failed. User not found.' }).code(201);
      }
    }).catch(err => {
      reply(Boom.notFound('internal db failure'));
    });
  },

};

exports.findAll = {
  auth: false,

  handler: function (request, reply) {
    User.find({}).then((users) => {
      users.map((user) => {
        delete user._doc.password;
        return user;
      });

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
        delete user._doc.password;
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
      delete newUser._doc.password;
      reply(newUser).code(201);
    }).catch((error) => {
      reply(Boom.badImplementation('error creating user'));
    });
  },
};

exports.update = {
  auth: {
    strategy: 'jwt',
  },

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
    const userInfo = request.auth.credentials;

    if (userInfo.id == request.params.id) {
      User.findByIdAndUpdate({ _id: request.params.id },  { $set: request.payload }, { new: true })
        .then((user) => {
          delete user.password;
          reply(user).code(200);
        }).catch((error) => {
          reply(Boom.badImplementation('error updating user'));
        });
    } else {
      reply(Boom.forbidden('insufficient permissions'));
    }
  },
};

exports.deleteOne = {
  auth: {
    strategy: 'jwt',
  },

  handler: function (request, reply) {
    const userInfo = request.auth.credentials;

    if (userInfo.id == request.params.id || _.includes(userInfo.scope, 'admin')) {
      User.remove({ _id: request.params.id }).then((user) => {
        reply().code(204);
      }).catch((error) => {
        reply(Boom.notFound('id not found'));
      });
    } else {
      reply(Boom.forbidden('insufficient permissions'));
    }
  },
};
