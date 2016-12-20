'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');
const User = require('../app/models/user');
const utils = require('../app/api/utils');

suite('User API tests', function () {
  let fixtures;
  let service;
  let users;

  // Reset all data (and fixtures), so we can create each test fully isolated.
  suiteSetup(function () {
    service = new TwitterService();
    return service.start();
  });

  setup(function () {
    return service.resetDB().then(dbData => {
      users = dbData.users;

      service.loginAPI(users[0]);

      fixtures = require('./data/fixtures.json');
    });
  });

  suiteTeardown(function () {
    return service.stop();
  });

  test('authenticate', function () {
    service.logoutAPI();

    return service.authenticateAPIUser(users[0]).then((res) => {
      assert.isTrue(res.json.success);

      delete users[0].password;
      assert.deepEqual(res.json.user, users[0]);

      const token = res.json.token;
      assert.isDefined(token);

      const userInfo = utils.decodeToken(token);
      assert.equal(userInfo.email, users[0].email);
      assert.equal(userInfo.scope.length, users[0].scope.length);
      assert.equal(userInfo.userId, users[0]._id);
    });
  });

  test('get users returns database users', function () {
    return service.getAPIUsers().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, users.length);

      for (let i = 0; i < users.length; i++) {
        delete users[i].password; // Server should never send out passwords
        assert.deepEqual(res.json[i], users[i]);
      }
    });
  });

  test('get user by id returns correct user details', function () {
    return service.getAPIUser(users[0]._id).then((res) => {
      assert.equal(res.statusCode, 200);

      // Adjust output of correct user
      delete users[0].password;
      users[0].followers = [users[2]._id];

      assert.deepEqual(res.json, users[0]);
    });
  });

  test('get user by invalid id returns not found', function () {
    return service.getAPIUser('abc').then((res) => {
      assert.equal(res.statusCode, 404);
      return service.getAPIUser('a'.repeat(24));
    }).then((res) => {
      assert.equal(res.statusCode, 404);
    });
  });

  test('delete existing user by id', function () {
    return service.deleteAPIUser(users[0]._id).then((res) => {
      assert.equal(res.statusCode, 204);
      assert.isNull(res.json);

      return service.getDBUser(users[0]._id);
    }).then((user) => {
      assert.isNull(user);
    });
  });

  test('try deleting other user by id should fail', function () {
    // We are logged in as users[0]
    return service.deleteAPIUser(users[1]._id).then((res) => {
      assert.equal(res.statusCode, 403);

      return service.getDBUsers();
    }).then((dbUsers) => {
      // Nothing should be deleted
      assert.equal(dbUsers.length, users.length);
    });
  });

  test('try deleting not existing user by id', function () {
    return service.deleteAPIUser(users[0]).then((res) => {
      assert.equal(res.statusCode, 403);

      return service.getDBUsers();
    }).then((dbUsers) => {
      // Nothing should be deleted
      assert.equal(dbUsers.length, users.length);
    });
  });

  test('create user with valid parameters', function () {
    let createdUser;

    return service.createAPIUser(fixtures.new_user).then((res) => {
      createdUser = res.json;

      // We do not expect to get this password back
      delete fixtures.new_user.password;

      assert.equal(res.statusCode, 201);
      assert(_.some([createdUser], fixtures.new_user),
              'createdUser is a superset of the fixture user');

      // Server should never return a password
      assert.isUndefined(createdUser.password);

      return service.getDBUser(createdUser._id);
    }).then((dbUser) => {
      delete dbUser.password;

      assert.deepEqual(createdUser, dbUser);
    });
  });

  test('try to create user without parameters', function () {
    return service.createAPIUser({}).then((res) => {
      assert.equal(res.statusCode, 400);

      return service.getDBUsers();
    }).then((dbUsers) => {
      // Nothing should be created
      assert.equal(dbUsers.length, users.length);
    });
  });

  test('update user with valid parameters', function () {
    const updates = { firstName: 'New', lastName: 'Name' };
    const updatedUser = _.merge(users[0], updates);
    delete updatedUser.updatedAt;
    let user;

    return service.updateAPIUser(users[0]._id, updates).then((res) => {
      user = res.json;

      assert.equal(res.statusCode, 200);
      assert(_.some([user], updatedUser));

      return service.getDBUser(res.json._id);
    }).then((dbUser) => {
      assert.deepEqual(user, dbUser);
    });
  });

  test('try to update user with invalid parameters', function () {
    const updates = { firstName: '', lastName: 'Name' };

    return service.updateAPIUser(users[0]._id, updates).then((res) => {
      assert.equal(res.statusCode, 400);

      return service.getDBUser(users[0]._id);
    }).then((dbUser) => {
      // DB should have no changes
      assert.deepEqual(dbUser, users[0]);
    });
  });

  test('try to update other users settings', function () {
    const updates = { firstName: 'New', lastName: 'Name' };

    return service.updateAPIUser(users[1]._id, updates).then((res) => {
      assert.equal(res.statusCode, 403);

      return service.getDBUser(users[1]._id);
    }).then((dbUser) => {
      // DB should have no changes
      assert.deepEqual(dbUser, users[1]);
    });
  });
});
