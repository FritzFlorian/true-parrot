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
  firstName: Joi.string().min(1).max(26).required(),
  lastName: Joi.string().min(1).max(26).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(26).required(),
  description: Joi.string().max(140).allow(''),
};
User.updateApiValidationSchema = {
  firstName: Joi.string().min(1).max(26),
  lastName: Joi.string().min(1).max(26),
  email: Joi.string().email(),
  description: Joi.string().max(140).allow(''),
  password: Joi.string().min(6).max(26),
};
User.updateWebValidationSchema = {
  firstName: Joi.string().min(1).max(26),
  lastName: Joi.string().min(1).max(26),
  email: Joi.string().email(),
  description: Joi.string().max(140).allow(''),
  password: Joi.string().min(6).max(26).allow(''),
};

module.exports = User;
