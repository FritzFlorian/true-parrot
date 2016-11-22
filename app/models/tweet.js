'use strict';

const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const tweetSchema = mongoose.Schema({
  message: String,
  image: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const Tweet = mongoose.model('Tweet', tweetSchema);

Tweet.validationSchema = {
  json: Joi.object({
    message: Joi.string().min(1).max(140).required(),
  }).required(),
  image: Joi.any(),
};

module.exports = Tweet;
