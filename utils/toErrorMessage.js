const HttpStatus = require('http-status-codes');
const request = require('../constants/request');

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

module.exports = (command, code, subCode, message = null) => {
  if (command === request.SECURITY_LOGIN && subCode === 2) {
    return `${codes[command][subCode]} - ${message || 'No reason provided'}`;
  }

  if (message) {
    return message;
  }

  if (codes[command] && codes[command][subCode]) {
    return codes[command][subCode];
  }

  return `Request ${command} failed with subCode ${subCode} (${HttpStatus.getReasonPhrase(code)})`;
};
