'use strict';
/**
 * Loads seed data from `./data.json` to the mongo database.
 * Use `npm run seed` to seed the database.
 */

const db = require('./db.js');

db.start().connection.once('open', () => {
  console.log('Starting to load seed data to db...');

  const seeder = require('mongoose-seeder');
  const data = require('./data.json');

  require('./user');
  require('./tweet');
  seeder.seed(data, { dropDatabase: false, dropCollections: true }).then(dbData => {
    console.log('Seeded data: ');
    console.log(dbData);
    process.exit(0);
  }).catch(error => {
    console.log(error);
    process.exit(1);
  });
});
