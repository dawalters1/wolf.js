const { StatusCodes } = require('http-status-codes');

class Response {
  constructor ({ code, body, headers }) {
    this.code = code;
    this.body = body;
    this.headers = headers;
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }
}

module.exports = Response;
