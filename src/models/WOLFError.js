const StatusCodeName = require('../constants/StatusCodeName');

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

const generateMessage = (request, response) => {
  if (response.headers && response.headers.subCode && codes[request.command]) {
    return codes[request.command][response.headers.subCode];
  }

  return StatusCodeName[response.code];
};

class WOLFError extends Error {
  constructor (request, response) {
    super(generateMessage(request, response));

    this.status = response.code;
    this.headers = response.headers;
  }
}

module.exports = WOLFError;
