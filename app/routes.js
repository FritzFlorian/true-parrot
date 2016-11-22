const Main = require('./controllers/main');
const Assets = require('./controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Main.main },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
