'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');

suite('Tweet API tests', function () {
  let fixtures;
  let service;
  let users;
  let tweets;

  // Reset all data (and fixtures), so we can create each test fully isolated.
  before((done) => {
    service = new TwitterService();
    service.start(done);
  });
  beforeEach(() =>
    service.resetDB().then(dbData => {
      users = dbData.users;
      tweets = dbData.tweets;
      fixtures = require('./fixtures.json');
    })
  );
  after(() => {
    service.stop();
  });
});
