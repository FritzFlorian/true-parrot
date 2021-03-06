'use strict';

const SampleApi = require('./api/sampleapi');
const UsersApi = require('./api/userapi');
const TweetsApi = require('./api/tweetapi');
const AdminApi = require('./api/adminapi');

module.exports = [
  { method: 'GET', path: '/api/sample', config: SampleApi.find },

  { method: 'GET', path: '/api/users', config: UsersApi.findAll },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'PATCH', path: '/api/users/{id}', config: UsersApi.update },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },
  { method: 'POST', path: '/api/users/authenticate', config: UsersApi.authenticate },
  { method: 'PATCH', path: '/api/users/{id}/follow', config: UsersApi.followOne },

  { method: 'GET', path: '/api/tweets', config: TweetsApi.findAll },
  { method: 'GET', path: '/api/following/tweets', config: TweetsApi.findAllOfFollowers },
  { method: 'GET', path: '/api/tweets/{id}', config: TweetsApi.findOne },
  { method: 'GET', path: '/api/users/{id}/tweets', config: TweetsApi.findAllByUser },
  { method: 'DELETE', path: '/api/users/{id}/tweets', config: TweetsApi.deleteAllByUser },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.create },
  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOne },
  { method: 'PATCH', path: '/api/tweets/{id}/parrot', config: TweetsApi.parrotOne },

  { method: 'POST', path: '/api/admin/tweets/batchDelete', config: AdminApi.deleteMultipleTweets },
  { method: 'POST', path: '/api/admin/users/batchDelete', config: AdminApi.deleteMultipleUsers },
  { method: 'GET', path: '/api/admin/stats', config: AdminApi.stats },
];
