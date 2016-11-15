const SampleApi = require('./api/sampleapi');

module.exports = [
  { method: 'GET', path: '/api/sample', config: SampleApi.find },
];
