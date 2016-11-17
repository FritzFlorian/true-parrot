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

  /**
   * Resets the database by deleting all data and inserting the `test/seed.json`
   * into the database.
   *
   * @returns {Promise} Returns the inserted database information when successful.
   */
  resetDB() {
    return new Promise((result, reject) => {
      this.server.db.dropDatabase((error, res) => {
        if (error) {
          reject(error);
        } else {
          const seeder = require('mongoose-seeder');
          const seedData = require('./seed.json');

          // Require all models to insert consistent db contents for tests
          require('../app/models/user');
          seeder.seed(seedData, { dropDatabase: false, dropCollections: true }).then(dbData => {
            result(dbData);
          }).catch(reject);
        }
      });
    });
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
