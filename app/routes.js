'use strict';

const Main = require('./controllers/main');
const Assets = require('./controllers/assets');
const User = require('./controllers/users');

module.exports = [

  { method: 'GET', path: '/', config: Main.main },
  { method: 'GET', path: '/signup', config: User.signup },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
