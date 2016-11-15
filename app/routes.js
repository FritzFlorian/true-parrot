const Sample = require('./controllers/sample');
const Assets = require('./controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Sample.main },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
