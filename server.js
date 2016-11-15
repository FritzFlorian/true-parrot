'use strict';

const Hapi = require('hapi');
const db = require('./app/models/db');

class Server {
  constructor(hapiServer, db) {
    this.hapiServer = hapiServer;
    this.db = db;
  }
};

function startHapiServer(db, resolve, reject) {
  // Init the basic server
  const server = new Hapi.Server();
  server.connection({ port: process.env.PORT || 4000 });

  // Register Plugins
  server.register([require('inert'), require('vision'), require('hapi-auth-cookie')], error => {

    /* istanbul ignore if */
    if (error) {
      reject(error);
    }

    // Add cookie based authentication
    server.auth.strategy('standard', 'cookie', {
      password: process.env.COOKIE_PASSWORD || 'oean531Oeuoeau}{oeuaoeu{}uoeauoeu',
      cookie: 'donation-cookie',
      isSecure: false,
      ttl: 24 * 60 * 60 * 1000,
      redirectTo: '/login',
    });
    server.auth.default({
      strategy: 'standard',
    });

    // Add html rendering engine
    server.views({
      engines: {
        hbs: require('handlebars'),
      },
      relativeTo: __dirname,
      path: './app/views',
      layoutPath: './app/views/layout',
      partialsPath: './app/views/partials',
      layout: true,
      isCached: false,
    });

    server.route(require('./app/routes'));
    server.route(require('./app/routesapi'));

    /* istanbul ignore else */
    if (process.env.NODE_ENV === 'test') {
      resolve(new Server(server, db));
    } else {
      server.start((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(new Server(server, db));
        }
      });
    }
  });
}

/**
 * Server Start Promise is returned.
 * Will resolve to the started server or reject with an error.
 */
module.exports = new Promise(function (resolve, reject) {
  db.once('open', () => {
    startHapiServer(db, resolve, reject);
  });
});
