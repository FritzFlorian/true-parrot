'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const password = process.env.JWT_PASSWORD || 'asoetuh!{}l+oestnuhouoe13AOUeothaus';

exports.createToken = function (user) {
  return jwt.sign({ id: user._id, email: user.email, scope: user.scope }, password, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
};

exports.decodeToken = function (token) {
  var userInfo = {};
  try {
    var decoded = jwt.verify(token, password);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
    userInfo.scope = decoded.scope;
  } catch (e) {
  }

  return userInfo;
};

exports.validate = function (decoded, request, callback) {
  User.findOne({ _id: decoded.id }).then(user => {
    if (user != null) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }).catch(err => {
    callback(null, false);
  });
};

exports.password = password;
