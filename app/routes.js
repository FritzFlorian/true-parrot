'use strict';

const Main = require('./controllers/main');
const Assets = require('./controllers/assets');
const User = require('./controllers/users');
const Tweet = require('./controllers/tweets');
const Admin = require('./controllers/admin');

module.exports = [

  { method: 'GET', path: '/', config: Main.main },
  { method: 'GET', path: '/signup', config: User.signup },
  { method: 'POST', path: '/register', config: User.register },
  { method: 'GET', path: '/login', config: User.login },
  { method: 'POST', path: '/authenticate', config: User.authenticate },
  { method: 'GET', path: '/logout', config: User.logout },
  { method: 'GET', path: '/settings', config: User.viewSettings },
  { method: 'POST', path: '/settings', config: User.updateSettings },
  { method: 'GET', path: '/users/{id}', config: User.profile },

  { method: 'GET', path: '/tweets', config: Tweet.showAll },
  { method: 'GET', path: '/tweet', config: Tweet.form },
  { method: 'POST', path: '/tweets', config: Tweet.create },
  { method: 'POST', path: '/tweets/{id}/delete', config: Tweet.deleteOne },
  { method: 'POST', path: '/tweets/{id}/parrot', config: Tweet.parrot },

  { method: 'GET', path: '/admin/dashboard', config: Admin.dashboard },
  { method: 'Post', path: '/admin/users/{id}/delete', config: Admin.deleteSingleUser },
  { method: 'GET', path: '/admin/users', config: Admin.listUsers },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
