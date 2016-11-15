'use strict';

const User = require('../app/models/user');

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

  // User API
  getAPIUsers() {
    return this.server.hapiServer.inject('/api/users');
  }

  getAPIUser(id) {
    return this.server.hapiSever.inject(`/api/users/${id}`);
  }

  createAPIUser(user) {
    return this.server.hapiSever.inject({ url: '/api/users', method: 'POST', payload: user });
  }

  deleteAPIUser(id) {
    return this.server.hapiSever.inject({ url: '/api/users/${id}', method: 'DELETE' });
  }

  // User DB
  getDBUsers() {
    return User.find({});
  }

  getDBUser(id) {
    return User.findOne({ _id: id });
  }

  createDBUser(user) {
    const newUser = new User(user);
    return newUser.save();
  }

  deleteDBUser(id) {
    return User.remove({ _id: id });
  }
}

module.exports = TwitterService;
