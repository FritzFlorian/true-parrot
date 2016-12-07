'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');
const User = require('../app/models/user');
const utils = require('../app/api/utils');

suite('Admin API tests', function () {
  let fixtures;
  let service;
  let users;
  let tweets;

  // Reset all data (and fixtures), so we can create each test fully isolated.
  suiteSetup(function () {
    service = new TwitterService();
    return service.start();
  });

  setup(function () {
    return service.resetDB().then(dbData => {
      users = dbData.users;
      tweets = dbData.tweets;

      // Login with admin user (marge)
      service.loginAPI(users[1]);

      fixtures = require('./data/fixtures.json');
    });
  });

  suiteTeardown(function () {
    return service.stop();
  });

  test('delete two tweets as admin', function () {
    const tweetsToDelete = [
      tweets[0]._id,
      tweets[1]._id,
    ];

    return service.deleteMultipleAPITweets(tweetsToDelete).then((res) => {
      assert.equal(res.statusCode, 204);

      return Tweet.find({});
    }).then((dbTweets) => {
      assert.equal(dbTweets.length, tweets.length - 2);
    });
  });

  test('delete no tweets as admin', function () {
    const tweetsToDelete = [
    ];

    return service.deleteMultipleAPITweets(tweetsToDelete).then((res) => {
      assert.equal(res.statusCode, 204);

      return Tweet.find({});
    }).then((dbTweets) => {
      assert.equal(dbTweets.length, tweets.length);
    });
  });

  test('try to delete two tweets as non admin', function () {
    service.logoutAPI();
    service.loginAPI(users[0]);

    const tweetsToDelete = [
      tweets[0]._id,
      tweets[1]._id,
    ];

    return service.deleteMultipleAPITweets(tweetsToDelete).then((res) => {
      assert.equal(res.statusCode, 403);

      return Tweet.find({});
    }).then((dbTweets) => {
      assert.equal(dbTweets.length, tweets.length);
    });
  });

  test('delete two users as admin', function () {
    const usersToDelete = [
      tweets[0]._id,
      tweets[1]._id,
    ];

    return service.deleteMultipleAPIUsers(usersToDelete).then((res) => {
      assert.equal(res.statusCode, 204);

      return User.find({});
    }).then((dbUsers) => {
      assert.equal(dbUsers.length, users.length - 2);
    });
  });

  test('delete no users as admin', function () {
    const usersToDelete = [
    ];

    return service.deleteMultipleAPIUsers(usersToDelete).then((res) => {
      assert.equal(res.statusCode, 204);

      return User.find({});
    }).then((dbUsers) => {
      assert.equal(dbUsers.length, users.length);
    });
  });
});
