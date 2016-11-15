'use strict';

class RequestService {
  constructor(hapiServer) {
    this.hapiServer = hapiServer;
  }

  get(route) {
    return this.makeRequest({ url: route, method: 'GET' });
  }

  post(route, payload = {}) {
    return this.makeRequest({ url: route, method: 'POST', payload: payload });
  }

  patch(route, payload = {}) {
    return this.makeRequest({ url: route, method: 'PATCH', payload: payload });
  }

  delete(route, payload = {}) {
    return this.makeRequest({ url: route, method: 'DELETE', payload: payload });
  }

  makeRequest(params) {
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
