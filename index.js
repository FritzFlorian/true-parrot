'use strict';

require('./server').then((server) => {
  console.log('Server listening at:', server.hapiSever.info.uri);
}).catch((error) => {
  throw (error);
});
