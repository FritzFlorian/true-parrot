'use strict';

const Main = require('./controllers/main');
const Assets = require('./controllers/assets');
const User = require('./controllers/users');

module.exports = [

  { method: 'GET', path: '/', config: Main.main },
  { method: 'GET', path: '/signup', config: User.signup },
  { method: 'POST', path: '/register', config: User.register },
  { method: 'GET', path: '/login', config: User.login },
  { method: 'POST', path: '/authenticate', config: User.authenticate },
  { method: 'GET', path: '/logout', config: User.logout },
  { method: 'GET', path: '/settings', config: User.viewSettings },
  { method: 'POST', path: '/settings', config: User.updateSettings },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
