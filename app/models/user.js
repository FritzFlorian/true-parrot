'use strict';

const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  description: String,
  scope: [String],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

User.validationSchema = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  description: Joi.string().allow(''),
};
User.updateApiValidationSchema = {
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  scope: Joi.array().items(Joi.string()),
  description: Joi.string().allow(''),
  password: Joi.string(),
};
User.updateWebValidationSchema = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  scope: Joi.array().items(Joi.string()),
  description: Joi.string().allow(''),
  password: Joi.string().allow(''),
};

module.exports = User;
