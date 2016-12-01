'use strict';

const utils = require('../app/api/utils');

class RequestService {
  constructor(hapiServer) {
    this.hapiServer = hapiServer;
    this.authHeader = null;
  }

  get(route) {
    return this.makeRequest({ url: route, method: 'GET' });
  }

  post(route, payload = {}, headers = {}) {
    return this.makeRequest({ url: route, method: 'POST', payload: payload, headers: headers });
  }

  patch(route, payload = {}) {
    return this.makeRequest({ url: route, method: 'PATCH', payload: payload });
  }

  delete(route, payload = {}) {
    return this.makeRequest({ url: route, method: 'DELETE', payload: payload });
  }

  setAuth(user) {
    const token = utils.createToken(user);
    this.authHeader = 'bearer ' + token;
  }

  clearAuth() {
    this.authHeader = null;
  }

  makeRequest(params) {
    params.headers = params.headers || {};
    params.headers.Authorization = this.authHeader;

    return new Promise((resolve, reject) => {
      this.hapiServer.inject(params).then((res) => {
        let json = null;
        if (res.payload.length > 0) {
          json = JSON.parse(res.payload);
        }

        const result = {
          statusCode: res.statusCode,
          json: json,
        };

        resolve(result);
      }).catch(reject);
    });
  }
}

module.exports = RequestService;
