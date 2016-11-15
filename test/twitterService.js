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
    return this.server.hapiServer.inject('/api/sample');
  }

  // Sample Static page
  getStaticSample() {
    return this.server.hapiServer.inject('/');
  }

  // User API
  getAPIUsers() {
    return this.server.hapiServer.inject('/api/users');
  }

  getAPIUser(id) {
    return this.server.hapiServer.inject(`/api/users/${id}`);
  }

  createAPIUser(params) {
    return this.server.hapiServer.inject({ url: '/api/users', method: 'POST', payload: params });
  }

  deleteAPIUser(id) {
    return this.server.hapiServer.inject({ url: `/api/users/${id}`, method: 'DELETE' });
  }

  updateAPIUser(id, params) {
    return this.server.hapiServer.inject({ url: `/api/users/${id}`, method: 'PATCH', payload: params });
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
