const { Commands } = require('../constants');
const HttpStatus = require('http-status-codes');

const codes = {
  'group member add': {
    1: 'Incorrect password',
    4: 'Higher level required',
    100: 'Group Full',
    101: 'Maximum permitted number of groups',
    105: 'Group does not exist',
    107: 'Banned',
    112: 'New users only',
    115: 'Group Locked',
    116: 'Too many accounts',
    117: 'Game join only',
    110: 'Already Joined'
  },
  'group create': {
    8: 'Group name already exists',
    9: 'Group name not allowed',
    15: 'Group name must be at least 3 characters'
  },
  'security login': {
    1: 'Incorrect email or password',
    2: 'TOS VIOLATIONS',
    3: 'Too many login attempts'
  }
};

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

    if (!this.success) {
      if (command === Commands.SECURITY_LOGIN && headers.subCode === 2) {
        return `${codes[command][headers.subCode]} - ${message || 'No reason provided'}`;
      }

      if (message) {
        return message;
      }

      if (codes[command] && codes[command][headers.subCode]) {
        return codes[command][headers.subCode];
      }

      return `Request ${command} failed with subCode ${headers.subCode} (${HttpStatus.getReasonPhrase(code)})`;
    }
  }

  get success () {
    return this.code >= 200 && this.code <= 299;
  }
}

module.exports = Response;
