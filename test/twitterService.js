'use strict';

const User = require('../app/models/user');
const Tweet = require('../app/models/tweet');
const RequestService = require('./requestService');
const Server = require('../server');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');
const fs = require('fs');

class TwitterService {
  // House Keeping of our connection/server
  start() {
    return Server.start().then((server) => {
      this.server = server;
      this.requestService = new RequestService(server.hapiServer);
    });
  }

  /**
   * Resets the database by deleting all data and inserting the `test/seed.json`
   * into the database.
   *
   * @returns {Promise} Returns the inserted database information when successful.
   */
  resetDB() {
    const seeder = require('mongoose-seeder');
    const seedData = require('./data/seed.json');

    // Insert consistent db contents for tests
    return seeder.seed(seedData, { dropDatabase: false, dropCollections: true })
                  .then((dbData) => this.seedResultToSimpleArrays(dbData));
  }

  stop() {
    return this.server.stop();
  }

  // Sample API
  getAPISample() {
    return this.requestService.get('/api/sample');
  }

  loginAPI(user) {
    this.requestService.setAuth(user);
  }

  logoutAPI() {
    this.requestService.clearAuth();
  }

  // Sample Static page
  getStaticSample() {
    return this.server.hapiServer.inject('/');
  }

  // User API
  authenticateAPIUser(params) {
    return this.requestService.post('/api/users/authenticate', params);
  }

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

  getAPISocialGraph() {
    return this.requestService.get('/api/social/tweets');
  }

  getAPITweetsByUser(id) {
    return this.requestService.get(`/api/users/${id}/tweets`);
  }

  getAPITweet(id) {
    return this.requestService.get(`/api/tweets/${id}`);
  }

  createAPITweet(tweetParams, tweetImagePath) {
    const form = new FormData();
    form.append('json', JSON.stringify(tweetParams), { contentType: 'application/json'});
    if (tweetImagePath) {
      form.append('image', fs.createReadStream(tweetImagePath));
    }

    const headers = form.getHeaders();

    return streamToPromise(form).then(payload =>
             this.requestService.post(`/api/tweets`, payload, headers)
           );
  }

  deleteAPITweet(id) {
    return this.requestService.delete(`/api/tweets/${id}`);
  }

  deleteAPITweetsByUser(id) {
    return this.requestService.delete(`/api/users/${id}/tweets`);
  }

  parrotAPITweet(id, parroting) {
    return this.requestService.patch(`/api/tweets/${id}/parrot`, { parroting: parroting });
  }

  // Tweet DB
  getDBTweets(findParams = {}) {
    return Tweet.find(findParams).then(tweets => JSON.parse(JSON.stringify(tweets)));
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

  // Admin API
  deleteMultipleAPITweets(tweetIds) {
    return this.requestService.post('/api/admin/tweets/batchDelete', tweetIds);
  }

  deleteMultipleAPIUsers(userIds) {
    return this.requestService.post('/api/admin/users/batchDelete', userIds);
  }

  getAPIAdminStats() {
    return this.requestService.get('/api/admin/stats');
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
