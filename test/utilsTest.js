'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');
const utils = require('../app/api/utils');

suite('Utils Tests', function () {
  let service;
  let users;

  suiteSetup(() => {
    service = new TwitterService();
    return service.start();
  });
  setup(() => service.resetDB().then((seeded) => users = seeded.users));
  suiteTeardown(() => service.stop());

  test('decoding token with non existing user should return null and false', function (done) {
    // Change id to be invalid
    users[0].id = 'a'.repeat(24);

    const token = utils.createToken(users[0]);
    const decodedToken = utils.decodeToken(token);

    utils.validate(decodedToken, null, (result, success) => {
      assert.isNull(result);
      assert.isFalse(success);
      done();
    });
  });
});
