'use strict';

const TwitterService = require('./twitterService');
const assert = require('chai').assert;
const _ = require('lodash');
const Tweet = require('../app/models/tweet');

suite('Tweet API tests', function () {
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

      service.loginAPI(users[0]);

      fixtures = _.cloneDeep(require('./data/fixtures.json'));

      return Tweet.find({}).sort({ createdAt: 'desc' }).limit(50).populate('creator').exec();
    }).then((populatedTweets) => {
      tweets = JSON.parse(JSON.stringify(populatedTweets));

      // Tweet users should not contain passwords
      tweets.map((tweet) => {
        delete tweet.creator.password;
        return tweet;
      });
    });
  });

  suiteTeardown(function () {
    return service.stop();
  });

  test('get tweets returns global timeline of tweets', function () {
    return service.getAPITweets().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, tweets.length);

      // Fixtures are already sorted by date, so we also test the order
      for (let i = 0; i < tweets.length; i++) {
        assert.deepEqual(res.json[i], tweets[i]);
      }
    });
  });

  test('get social graph returns tweets of followed users', function () {
    // Login Bart, hes the only one with followers (avoid seeding issues)
    service.logoutAPI();
    service.loginAPI(users[2]);

    return service.getAPISocialGraph().then((res) => {
      assert.equal(res.statusCode, 200);

      // Bart follows homer, filter out all other tweets.
      tweets = tweets.filter(tweet => tweet.creator.firstName == 'Homer');

      assert.equal(res.json.length, tweets.length);

      // Fixtures are already sorted by date, so we also test the order
      for (let i = 0; i < tweets.length; i++) {
        assert.deepEqual(res.json[i], tweets[i]);
      }
    });
  });

  test('try to get social graph without login', function () {
    service.logoutAPI();

    return service.getAPISocialGraph().then((res) => {
      assert.equal(res.statusCode, 401);
    });
  });

  test('get tweet by id returns correct tweet details', function () {
    return service.getAPITweet(tweets[0]._id).then((res) => {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json, tweets[0]);
    });
  });

  test('get tweets by user returns users timeline of tweets', function () {
    return service.getAPITweetsByUser(users[0]._id).then((res) => {
      const tweetsByUser = tweets.filter(tweet => tweet.creator._id === users[0]._id);

      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, tweetsByUser.length);

      // Fixtures are already sorted by date, so we also test the order
      for (let i = 0; i < tweetsByUser.length; i++) {
        assert.deepEqual(res.json[i], tweetsByUser[i]);
      }
    });
  });

  test('get tweet by invalid id returns not found', function () {
    return service.getAPITweet('abc').then((res) => {
      assert.equal(res.statusCode, 404);
      return service.getAPITweet('a'.repeat(24));
    }).then((res) => {
      assert.equal(res.statusCode, 404);
    });
  });

  test('delete existing tweet by id', function () {
    return service.deleteAPITweet(tweets[0]._id).then((res) => {
      assert.equal(res.statusCode, 204);
      assert.isNull(res.json);

      return service.getDBTweet(tweets[0]._id);
    }).then((tweet) => {
      assert.isNull(tweet);
    });
  });

  test('delete all own tweets', function () {
    return service.deleteAPITweetsByUser(users[0]._id).then((res) => {
      assert.equal(res.statusCode, 200);

      return service.getDBTweets({ creator: users[0]._id });
    }).then((tweets) => {
      assert.equal(tweets.length, 0);
    });
  });

  test('try to delete all tweets by other user', function () {
    return service.deleteAPITweetsByUser(users[1]._id).then((res) => {
      assert.equal(res.statusCode, 403);

      return service.getDBTweets({ creator: users[1]._id });
    }).then((tweets) => {
      assert.notEqual(tweets.length, 0);
    });
  });

  test('try deleteing tweet of other user by id', function () {
    return service.deleteAPITweet(tweets[1]._id).then((res) => {
      assert.equal(res.statusCode, 403);

      return service.getDBTweet(tweets[1]._id);
    }).then((tweet) => {
      assert.isNotNull(tweet);
    });
  });

  test('try deleteing tweet without being logged in', function () {
    service.logoutAPI();

    return service.deleteAPITweet(tweets[1]._id).then((res) => {
      assert.equal(res.statusCode, 401);

      return service.getDBTweet(tweets[1]._id);
    }).then((tweet) => {
      assert.isNotNull(tweet);
    });
  });

  test('try deleting not existing tweet by id', function () {
    return service.deleteAPITweet(tweets[0]).then((res) => {
      assert.equal(res.statusCode, 404);

      return service.getDBTweets();
    }).then((dbTweets) => {
      // Nothing should be deleted
      assert.equal(dbTweets.length, tweets.length);
    });
  });

  test('create tweet with valid parameters (no image)', function () {
    let createdTweet;

    return service.createAPITweet(fixtures.new_tweet).then((res) => {
      createdTweet = res.json;

      assert.equal(res.statusCode, 201);
      assert(_.some([createdTweet], fixtures.new_tweet),
          'createdTweet is a superset of the fixture tweet');

      return service.getDBTweet(createdTweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(createdTweet, dbTweet);
    });
  });

  test('create tweet with valid parameters (with image)', function () {
    this.timeout(10000);

    let createdTweet;
    const imagePath =  `${__dirname}/data/sample.jpg`;

    return service.createAPITweet(fixtures.new_tweet, imagePath).then((res) => {
      createdTweet = res.json;

      assert.equal(res.statusCode, 201);
      assert(_.some([createdTweet], fixtures.new_tweet),
          'createdTweet is a superset of the fixture tweet');
      assert.isNotNull(createdTweet.image);

      return service.getDBTweet(createdTweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(createdTweet, dbTweet);
    });
  });

  test('try to create tweet without parameters', function () {
    return service.createAPITweet({}).then((res) => {
      assert.equal(res.statusCode, 400);

      return service.getDBTweets();
    }).then((dbTweet) => {
      // Nothing should be created
      assert.equal(dbTweet.length, tweets.length);
    });
  });

  test('try create tweet without being logged in', function () {
    service.logoutAPI();

    return service.createAPITweet(fixtures.new_tweet).then((res) => {
      assert.equal(res.statusCode, 401);
    });
  });

  test('parrot valid tweet that is not already parroted', function () {
    let tweet;

    return service.parrotAPITweet(tweets[0]._id, true).then((res) => {
      assert.equal(res.statusCode, 200);
      tweet = res.json;

      // The current user should be parroting now
      assert.isTrue(_.includes(tweet.parroting, users[0]._id));

      return service.getDBTweet(tweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(tweet, dbTweet);
    });
  });

  test('parrot valid tweet that is already parroted', function () {
    let tweet;

    return service.parrotAPITweet(tweets[2]._id, true).then((res) => {
      assert.equal(res.statusCode, 200);
      tweet = res.json;

      // The current user should be parroting now
      assert.isTrue(_.includes(tweet.parroting, users[0]._id));

      return service.getDBTweet(tweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(tweet, dbTweet);
    });
  });

  test('try parroting tweet without being logged in', function () {
    service.logoutAPI();

    return service.parrotAPITweet(tweets[0]._id, true).then((res) => {
      assert.equal(res.statusCode, 401);
    });
  });

  test('unparrot tweet that is already parroted', function () {
    let tweet;

    return service.parrotAPITweet(tweets[2]._id, false).then((res) => {
      assert.equal(res.statusCode, 200);
      tweet = res.json;

      // The current user should be parroting now
      assert.isFalse(_.includes(tweet.parroting, users[0]._id));

      return service.getDBTweet(tweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(tweet, dbTweet);
    });
  });

  test('unparrot tweet that is not parroted', function () {
    let tweet;

    return service.parrotAPITweet(tweets[0]._id, false).then((res) => {
      assert.equal(res.statusCode, 200);
      tweet = res.json;

      // The current user should be parroting now
      assert.isFalse(_.includes(tweet.parroting, users[0]._id));

      return service.getDBTweet(tweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(tweet, dbTweet);
    });
  });

  test('try to unparrot tweet without being logged in', function () {
    service.logoutAPI();

    return service.parrotAPITweet(tweets[2]._id, false).then((res) => {
      assert.equal(res.statusCode, 401);
    });
  });

  test('parrot non existing tweet', function () {
    return service.parrotAPITweet('abcd', true).then((res) => {
      assert.equal(res.statusCode, 404);

      return service.parrotAPITweet('a'.repeat(24));
    }).then((res) => {
      assert.equal(res.statusCode, 404);
    });
  });
});
