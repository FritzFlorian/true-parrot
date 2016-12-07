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
  suiteSetup(() => {
    service = new TwitterService();
    return service.start();
  });
  setup(() =>
    service.resetDB().then(dbData => {
      users = dbData.users;
      tweets = dbData.tweets;

      // Login with admin user (marge)
      service.loginAPI(users[1]);

      fixtures = require('./data/fixtures.json');
    })
  );
  suiteTeardown(() => service.stop());

  test('delete two tweets as admin', () => {
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
});
