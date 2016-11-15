'use strict';

const User = require('../app/models/user');
const RequestService = require('./requestService');

class TwitterService {
  // House Keeping of our connection/server
  start(done) {
    require('../server').then((server) => {
      this.server = server;
      this.requestService = new RequestService(server.hapiServer);
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
    return this.requestService.get('/api/sample');
  }

  // Sample Static page
  getStaticSample() {
    return this.server.hapiServer.inject('/');
  }

  // User API
  getAPIUsers() {
    return this.requestService.get('/api/users');
  }

  getAPIUser(id) {
    return this.requestService.get(`/api/users/${id}`);
  }

  createAPIUser(params) {
    return this.requestService.post('/api/users', params);
  }

  deleteAPIUser(id) {
    return this.requestService.delete(`/api/users/${id}`);
  }

  updateAPIUser(id, params) {
    return this.requestService.patch(`/api/users/${id}`, params);
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
