'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let dbURI = 'mongodb://localhost/twitter';
if (process.env.NODE_ENV === 'production') {
  /* istanbul ignore next */
  dbURI = process.env.MONGOLAB_URI;
} else if (process.env.NODE_ENV === 'test') {
  dbURI = 'mongodb://localhost/twitter-test';
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', (err) => {
  /* istanbul ignore next */
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = mongoose.connection;
