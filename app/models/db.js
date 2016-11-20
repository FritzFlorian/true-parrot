'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Register Callbacks
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + mongoose.connection.host + ':' +
              mongoose.connection.port + '/' + mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  /* istanbul ignore next */
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Class to allow closing/opening of connections
class DB {
  constructor() {
    this.connection = mongoose.connection;
  }

  stop() {
    return mongoose.disconnect();
  }

  static start() {
    let dbURI = 'mongodb://localhost/twitter';
    if (process.env.NODE_ENV === 'production') {
      /* istanbul ignore next */
      dbURI = process.env.MONGOLAB_URI;
    } else if (process.env.NODE_ENV === 'test') {
      dbURI = 'mongodb://localhost/twitter-test';
    }

    mongoose.connect(dbURI);

    return new DB();
  }
}

module.exports = DB;
