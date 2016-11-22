'use strict';

const User = require('../models/user');

const Joi = require('joi');

exports.signup = {
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
    if (request.auth.isAuthenticated) {
      reply.redirect('/');
      return;
    }

    reply.view('signup', { title: 'Sign Up' });
  },

};

exports.register = {
  auth: false,
  validate: {

    payload: User.validationSchema,

    failAction: function (request, reply, source, error) {
      reply.view('signup', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const user = new User(request.payload);

    user.save().then(newUser => {
      reply.redirect('/login');
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.login = {
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
    if (request.auth.isAuthenticated) {
      reply.redirect('/');
      return;
    }

    reply.view('login', { title: 'Login' });
  },

};

exports.authenticate = {
  auth: false,
  validate: {

    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('login', {
        title: 'Login error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        setCurrentUser(request, foundUser);
        reply.redirect('/');
      } else {
        reply.view('login', {
          title: 'Login error',
          errors: [
            {
              message: 'Invalid email/password combination. Please check your password.',
              path: 'email',
            },
          ],
        }).code(400);
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

function setCurrentUser(request, user) {
  request.cookieAuth.set({
    loggedIn: true,
    loggedInUserId: user._id,
    loggedInUserEmail: user.email,
    loggedInUserFirstName: user.firstName,
    loggedInUserLastName: user.lastName,
  });
};
