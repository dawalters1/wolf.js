
module.exports = class Response {
  constructor (arg1, arg2, arg3) {
    if (typeof (arg1) === 'object') {
      this.code = arg1.code;

      if (arg1.body) {
        this.body = arg1.body;
      }

      this.headers = arg1.headers;
    } else {
      this.code = arg1;

      if (arg2) {
        this.body = arg2;
      }

      this.headers = arg3;
    }
  }

  get success () {
    return this.code >= 200 && this.code <= 299;
  }
};
