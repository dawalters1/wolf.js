const toErrorMessage = require('../internalUtils/toErrorMessage');

/**
 * {@hideconstructor}
 */
module.exports = class Response {
  constructor (arg1, arg2, arg3, command = undefined) {
    if (typeof (arg1) === 'object') {
      if (arg1.message) {
        this.code = 403;
      } else {
        this.code = arg1.code;

        if (arg1.body) {
          this.body = arg1.body;
        }

        this.headers = arg1.headers;
      }
    } else {
      this.code = arg1;

      if (arg2) {
        this.body = arg2;
      }

      this.headers = arg3;
    }

    if (command) {
      if (this.headers && this.headers.subCode) {
        this.headers.message = toErrorMessage(command, this.code, this.headers.subCode, this.headers.message);
      }
    }
  }

  get success () {
    return this.code >= 200 && this.code <= 299;
  }
};
