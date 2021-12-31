const { Commands } = require('../constants');

const statusCodes = {
  100: 'Continue',
  200: 'OK',
  203: 'Non-Authoritative Information',
  206: 'Partial Content',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  306: 'Unused',
  307: 'Temporary Redirect',
  308: 'Permananent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',
  420: 'Enhance Your Calm',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Reserved for WebDAV',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  444: 'No Response',
  449: 'Retry With',
  450: 'Blocked by Windows Parental Controls',
  451: 'Unavailable For Legal Reasons',
  499: 'Client Closed Request',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required',
  598: 'Network read timeout error',
  599: 'Network connect timeout error'
};

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

const codeForMessage = {
  'Endpoint request timed out': 408
};

class Response {
  constructor ({ code, body, headers, message }, command = undefined) {
    if (message) {
      this.code = codeForMessage[message] || 400;
      this.body = body;
      this.headers = { message };
    } else {
      this.code = code;
      this.body = body;
      this.headers = headers || {};
    }

    if (!this.success) {
      if (this.headers && this.headers.message) {
        return;
      }

      if (this.headers && !this.headers.subCode) {
        this.headers.message = `Request ${command} failed (${statusCodes[this.code]})`;
      } else if (command === Commands.SECURITY_LOGIN && this.headers.subCode === 2) {
        this.headers.message = `${codes[command][this.headers.subCode]} - ${message || 'No reason provided'}`;
      } else if (message) {
        this.headers.message = message;
      } else if (codes[command] && codes[command][this.headers.subCode]) {
        this.headers.message = codes[command][this.headers.subCode];
      } else {
        this.headers.message = `Request ${command} failed with subCode ${this.headers.subCode} (${statusCodes[this.code]})`;
      }
    }

    if (!this.body) {
      Reflect.deleteProperty(this, 'body');
    }
  }

  get success () {
    return this.code >= 200 && this.code <= 299;
  }
}

module.exports = Response;
