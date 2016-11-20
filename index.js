'use strict';

const Server = require('./server');

Server.start().then((server) => {
  console.log('Server listening at:', server.hapiServer.info.uri);
}).catch((error) => {
  throw (error);
});
