'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');

suite('Sample tests', function () {
  let service;

  suiteSetup(() => {
    service = new TwitterService();
    return service.start();
  });
  setup(() => service.resetDB());
  suiteTeardown(() => service.stop());

  test('sample api endpoint responds with 200 and data', () => {
    const expectedResult = { key: 'value' };

    return service.getAPISample().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json, expectedResult);
    });
  });

  test('sample static endpoint responds with 200 and template', () =>
    service.getStaticSample().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.include(res.payload, 'hare your thoughts with this innovative twitter clone!');
    })
  );
});
