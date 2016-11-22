'use strict';

const User = require('../models/user');

const Joi = require('joi');
const gravatar = require('gravatar');

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

exports.logout = {
  auth: false,
  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },
};

exports.viewSettings = {
  handler: function (request, reply) {
    const currentUserId = request.auth.credentials.loggedInUserId;
    User.findOne({ _id: currentUserId }).then(user => {
      reply.view('settings', { title: 'Account Settings', user: user });
    }).catch(error => {
      reply.redirect('/');
    });
  },
};

exports.updateSettings = {
  validate: {
    payload: User.updateValidationSchema,

    failAction: function (request, reply, source, error) {
      reply.view('settings', {
        title: 'Settings error',
        user: request.payload,
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },
  handler: function (request, reply) {
    const currentUserId = request.auth.credentials.loggedInUserId;
    const newUser = request.payload;
    if (newUser.password.length == 0) {
      delete newUser.password;
    }

    User.findByIdAndUpdate({ _id: currentUserId },  { $set: request.payload }, { new: true })
        .then((user) => {
          reply.view('settings', { title: 'Account Settings', user: user });
        }).catch((error) => {
          reply.redirect('/');
        });
  },
};

exports.profile = {
  auth: false,

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then((user) => {
      if (user) {
        delete user.password;
        user.gravatar = gravatar.url(user.email,  { s: '400' });

        reply.view('profile', { user: user });
      } else {
        reply.redirect('/');
      }
    }).catch((error) => {
      reply.redirect('/');
    });
  },
};
