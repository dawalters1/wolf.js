
class Response {
  constructor (code, body, headers) {
    this.code = code;
    this.body = body;
    this.headers = headers;
  }

  get success () {
    return this.code >= 200 || this.code < 300;
  }
}

module.exports = Response;
