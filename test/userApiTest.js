'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');
const fixtures = require('./fixtures.json');
const User = require('../app/models/user');

suite('User API tests', function () {
  let service;
  let users;

  // Setup consistent data for each test run
  before((done) => {
    service = new TwitterService();
    service.start(done);
  });
  beforeEach(() =>
    service.resetDB().then(dbData => {
      users = Object.keys(dbData.users).map(userKey => dbData.users[userKey]);
      users = users.map(user => JSON.parse(JSON.stringify(user)));
    })
  );
  after(() => {
    service.stop();
  });

  test('get users returns database users', () =>
    service.getAPIUsers().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, users.length);

      for (let i = 0; i < users.length; i++) {
        assert.deepEqual(res.json[i], users[i]);
      }
    })
  );

  test('get user by id returns correct user details', () =>
    service.getAPIUser(users[0]._id).then((res) => {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json, users[0]);
    })
  );

  test('get user by invalid id returns not found', () =>
    service.getAPIUser('abc').then((res) => {
      assert.equal(res.statusCode, 404);
      return service.getAPIUser('a'.repeat(24));
    }).then((res) => {
      assert.equal(res.statusCode, 404);
    })
  );

  test('delete existing user by id', () =>
    service.deleteAPIUser(users[0]._id).then((res) => {
      assert.equal(res.statusCode, 204);
      assert.isNull(res.json);

      return service.getDBUser(users[0]._id);
    }).then((user) => {
      assert.isNull(user);
    })
  );

  test('try deleting not existing user by id', () =>
    service.deleteAPIUser(users[0]).then((res) => {
      assert.equal(res.statusCode, 404);

      return service.getDBUsers();
    }).then((dbUsers) => {
      // Nothing should be deleted
      assert.equal(dbUsers.length, users.length);
    })
  );

  test('create user with valid parametrs', () => {
    let createdUser;

    return service.createAPIUser(fixtures.new_user).then((res) => {
      assert.equal(res.statusCode, 201);
      createdUser = res.json;
      assert(_some(createdUser, fixtures.new_user));

      return service.getDBUser(createdUser._id);
    }).then((dbUser) => {
      assert.deepEqual(createdUser, dbUser);
    });
  });

  test('try to create user without parameters', () =>
    service.createAPIUser({}).then((res) => {
      assert.equal(res.statusCode, 500);

      return service.getDBUsers();
    }).then((dbUsers) => {
      // Nothing should be created
      assert.equal(dbUsers.length, users.length);
    })
  );

  test('update user with valid parameters', () => {
    const updates = { firstName: 'New', lastName: 'Name' };
    const updatedUser = _.merge({}, [users[0], updates]);
    let user;

    return service.updateAPIUser(users[0]._id, updates).then((res) => {
      assert.equal(res.satusCode, 200);
      user = res.json;
      assert(_some(user, updatedUser));

      return service.getDBUser(res.json._id);
    }).then((dbUser) => {
      assert.deepEqual(user, dbUser);
    });
  });
});
