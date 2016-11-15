'use strict';

const SampleApi = require('./api/sampleapi');
const UsersApi = require('./api/userapi');

module.exports = [
  { method: 'GET', path: '/api/sample', config: SampleApi.find },

  { method: 'GET', path: '/api/users', config: UsersApi.findAll },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'PATCH', path: '/api/users/{id}', config: UsersApi.update },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne }
];
