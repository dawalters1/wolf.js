import { StatusCodes } from 'http-status-codes';

class Response {
  constructor ({ code, status, body, headers }) {
    this.code = status || code;
    this.body = body;
    this.headers = headers;
  }

  get success () {
    return this.code >= StatusCodes.OK && this.code < StatusCodes.MULTIPLE_CHOICES;
  }

  toJSON () {
    return {
      code: this.code,
      body: this.body,
      headers: JSON.stringify(this.headers)
    };
  }
}

export default Response;
