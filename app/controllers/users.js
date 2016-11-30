'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');

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
      request.yar.flash('info', ['You are already logged in.'], true);
      reply.redirect('/tweets');
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
      request.yar.flash('info', ['Successfully Registered. Please Login.'], true);
      reply.redirect('/login');
    }).catch(err => {
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/signup');
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
      request.yar.flash('info', ['You are already logged in.'], true);
      reply.redirect('/tweets');
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

        request.yar.flash('info', ['Logged in successfully.'], true);
        reply.redirect('/tweets');
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
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/login');
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

    request.yar.flash('info', ['You successfully logged out of your account.'], true);
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
    payload: User.updateWebValidationSchema,

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
          request.yar.flash('info', ['An internal error occurred, please try again.'], true);
          reply.redirect('/settings');
        });
  },
};

exports.profile = {
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
    let user;

    User.findOne({ _id: request.params.id }).then((foundUser) => {
      if (foundUser) {
        delete foundUser.password;
        user = foundUser;

        return Tweet
                .find({ creator: user._id })
                .sort({ createdAt: 'desc' })
                .limit(50)
                .populate('creator')
                .exec();
      } else {
        return null;
      }
    }).then((tweets) => {
      if (user) {
        reply.view('profile', { user: user, tweets: tweets });
      } else {
        request.yar.flash('info', ['Could not find this user.'], true);
        reply.redirect('/tweets');
      }
    }).catch((error) => {
      request.yar.flash('info', ['An internal error occurred, please try again.'], true);
      reply.redirect('/tweets');
    });
  },
};
