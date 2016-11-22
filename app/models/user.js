'use strict';

const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

User.validationSchema = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};
User.updateApiValidationSchema = {
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
};
User.updateWebValidationSchema = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().allow(''),
};

module.exports = User;
