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
  suiteSetup(() => {
    service = new TwitterService();
    return service.start();
  });
  setup(() =>
    service.resetDB().then(dbData => {
      users = dbData.users;

      fixtures = require('./fixtures.json');

      return Tweet.find({}).sort({ createdAt: 'desc' }).limit(50).populate('creator').exec();
    }).then((populatedTweets) => {
      tweets = JSON.parse(JSON.stringify(populatedTweets));
    })
  );
  suiteTeardown(() => service.stop());

  test('get tweets returns global timeline of tweets', () =>
    service.getAPITweets().then((res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, tweets.length);

      // Fixtures are already sorted by date, so we also test the order
      for (let i = 0; i < tweets.length; i++) {
        assert.deepEqual(res.json[i], tweets[i]);
      }
    })
  );

  test('get tweet by id returns correct tweet details', () =>
    service.getAPITweet(tweets[0]._id).then((res) => {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json, tweets[0]);
    })
  );

  test('get tweets by user returns users timeline of tweets', () =>
    service.getAPITweetsByUser(users[0]._id).then((res) => {
      const tweetsByUser = tweets.filter(tweet => tweet.creator._id === users[0]._id);

      assert.equal(res.statusCode, 200);
      assert.equal(res.json.length, tweetsByUser.length);

      // Fixtures are already sorted by date, so we also test the order
      for (let i = 0; i < tweetsByUser.length; i++) {
        assert.deepEqual(res.json[i], tweetsByUser[i]);
      }
    })
  );

  test('get tweet by invalid id returns not found', () =>
    service.getAPITweet('abc').then((res) => {
      assert.equal(res.statusCode, 404);
      return service.getAPITweet('a'.repeat(24));
    }).then((res) => {
      assert.equal(res.statusCode, 404);
    })
  );

  test('delete existing tweet by id', () =>
    service.deleteAPITweet(tweets[0]._id).then((res) => {
      assert.equal(res.statusCode, 204);
      assert.isNull(res.json);

      return service.getDBTweet(tweets[0]._id);
    }).then((tweet) => {
      assert.isNull(tweet);
    })
  );

  test('try deleting not existing tweet by id', () =>
    service.deleteAPITweet(tweets[0]).then((res) => {
      assert.equal(res.statusCode, 404);

      return service.getDBTweets();
    }).then((dbTweets) => {
      // Nothing should be deleted
      assert.equal(dbTweets.length, tweets.length);
    })
  );

  test('create tweet with valid parameters (no image)', () => {
    let createdTweet;

    return service.createAPITweet(users[0]._id, fixtures.new_tweet).then((res) => {
      createdTweet = res.json;

      assert.equal(res.statusCode, 201);
      assert(_.some([createdTweet], fixtures.new_tweet),
          'createdTweet is a superset of the fixture tweet');

      return service.getDBTweet(createdTweet._id);
    }).then((dbTweet) => {
      assert.deepEqual(createdTweet, dbTweet);
    });
  });

  test('create tweet with valid parameters (with image)', () => {
    let createdTweet;
    const imagePath =  `${__dirname}/sample.jpg`;

    return service.createAPITweet(users[0]._id, fixtures.new_tweet, imagePath).then((res) => {
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

  test('try to create tweet without parameters', () =>
    service.createAPITweet(users[0]._id, {}).then((res) => {
      assert.equal(res.statusCode, 400);

      return service.getDBTweets();
    }).then((dbTweet) => {
      // Nothing should be created
      assert.equal(dbTweet.length, tweets.length);
    })
  );

  test('try to create tweet for invalid user', () =>
    service.createAPITweet('a'.repeat(24), fixtures.new_tweet).then((res) => {
      assert.equal(res.statusCode, 400);

      return service.getDBTweets();
    }).then((dbTweet) => {
      // Nothing should be created
      assert.equal(dbTweet.length, tweets.length);
    })
  );
});
