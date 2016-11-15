'use strict';

class TwitterService {
  // House Keeping of our connection/server
  constructor() {
    this.server = undefined;
  }

  start(done) {
    require('../server').then((server) => {
      this.server = server;
      done();
    }).catch(done);
  }

  clearDB() {
    this.server.db.dropDatabase();
  }

  stop() {
    this.server.db.close();
  }

  // Sample API
  getAPISample() {
    return this.server.hapiSever.inject('/api/sample');
  }

  // Sample Static page
  getStaticSample() {
    return this.server.hapiSever.inject('/');
  }
}

module.exports = TwitterService;
