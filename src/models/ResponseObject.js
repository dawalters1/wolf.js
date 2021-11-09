
class Response {
  constructor ({ code, body, headers, message }, command = undefined) {
    if (message) {
      this.code = code || 403;
      this.headers = { message };
    } else {
      this.code = code;
      this.body = body;
      this.headers = headers;
    }

    if (command) {
      // TODO:
    }
  }

  get success () {
    return this.code >= 200 && this.code <= 299;
  }
}

module.exports = Response;
