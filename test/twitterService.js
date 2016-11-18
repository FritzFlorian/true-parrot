'use strict';

const User = require('../app/models/user');
const Tweet = require('../app/models/tweet');
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

          // Insert consistent db contents for tests
          seeder.seed(seedData, { dropDatabase: false, dropCollections: true })
          .then((dbData) => this.seedResultToSimpleArrays(dbData))
          .then(dbData => {
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
    return User.find({}).then(users => JSON.parse(JSON.stringify(users)));
  }

  getDBUser(id) {
    return User.findOne({ _id: id }).then(user => JSON.parse(JSON.stringify(user)));
  }

  createDBUser(user) {
    const newUser = new User(user);
    return newUser.save();
  }

  deleteDBUser(id) {
    return User.remove({ _id: id });
  }

  // Tweet Api
  getAPITweets() {
    return this.requestService.get('/api/tweets');
  }

  getAPITweetsByUser() {
    return this.requestService.get('/api/users/{id}/tweets');
  }

  getAPITweet(id) {
    return this.requestService.get('/api/tweets/{id}');
  }

  createAPITweet(userId, tweetParams) {
    return this.requestService.post('/api/users/{id}/tweets', tweetParams);
  }

  deleteAPITweet(id) {
    return this.requestService.delete('/api/tweets/{id}');
  }

  // Tweet DB
  getDBTweets() {
    return Tweet.find({}).then(tweets => JSON.parse(JSON.stringify(tweets)));
  }

  getDBTweet(id) {
    return Tweet.findOne({ _id: id }).then(tweet => JSON.parse(JSON.stringify(tweet)));
  }

  createDBTweet(tweet) {
    const newTweet = new Tweet(tweet);
    return newTweet.save();
  }

  deleteDBTweet(id) {
    return Tweet.remove({ _id: id });
  }

  // Helpers
  seedResultToSimpleArrays(dbData) {
    const result = {};

    Object.keys(dbData).forEach((collectionKey) => {
      let collection = dbData[collectionKey];

      const asArray = Object.keys(collection).map(key => collection[key]);
      const simpleJson = asArray.map(element => JSON.parse(JSON.stringify(element)));

      result[collectionKey] = simpleJson;
    });

    return result;
  }
}

module.exports = TwitterService;
