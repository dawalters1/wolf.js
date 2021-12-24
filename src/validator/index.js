const tlds = require('tldts');

// eslint-disable-next-line prefer-regex-literals
const START_REGEX = new RegExp(/^([!"#$%&'()*+,-./:؛;<=>?@[\]^_`{|}~،]|\s+)/, 'g');
// eslint-disable-next-line prefer-regex-literals
const END_REGEX = new RegExp(/([!"#$%&'()*+,-./:؛;<=>?@[\]^_`{|}~،]|\s)+$/, 'g');

const trimPunctuation = (string) => {
  if (string) {
    return string.replace(START_REGEX, '').replace(END_REGEX, '');
  }
  return string;
};

const isType = (arg, type) => {
  const typeOf = typeof arg;
  switch (type) {
    case 'string':
      return typeOf === 'string';
    case 'function':
      return typeOf === 'function';
    case 'object':
      return typeOf === 'object';
    case 'bigint':
      return typeOf === 'bigint';
    case 'symbol':
      return typeOf === 'symbol';
    case 'number':
      return typeOf === 'number';
    case 'boolean':
      return typeOf === 'boolean';
    case 'undefined':
      return typeOf === undefined;
  }

  throw new Error('type is not a valid typeof');
};
const isNull = arg => arg === null;

const isNullOrUndefined = arg => arg === null || arg === undefined;

const isNullOrWhitespace = arg => isNullOrUndefined(arg) || (typeof (arg) === 'string' && arg.trim().length === 0);

const isLessThanOrEqualZero = arg => isValidNumber(arg) && !(parseInt(arg) > 0);

const isLessThanZero = arg => isValidNumber(arg) && !(parseInt(arg) >= 0);

const isValidNumber = (arg, acceptDecimals = false) => (acceptDecimals ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/).test(arg);

const isValidArray = arg => Array.isArray(arg);

const isValidBoolean = arg => typeof arg === 'boolean' || (typeof arg === 'number' && (arg === 1 || arg === 0));

const isValidDate = arg => !isNaN(new Date(arg).getDate());

const isBuffer = arg => Buffer.isBuffer(arg);

const isValidUrl = (api, arg) => {
  if (arg && !(arg.startsWith('[') && arg.endsWith(']'))) {
    if ((arg.includes('.') || arg.includes(':'))) {
      let link = trimPunctuation(arg.toLowerCase());

      const protocol = api._botConfig.get('validation.link.protocols').sort((a, b) => b.length - a.length).find((proto) => arg.toLowerCase().startsWith(proto));

      if (protocol) {
        link = link.slice(protocol ? protocol.length : 0);
      }

      const args = link.split(protocol === 'wolf://' ? '/' : /[.:]/g).filter(Boolean);

      if (protocol === 'wolf://') {
        return args.length > 0;
      }

      if (args.length >= 2) {
        try {
          const data = new URL(`${protocol || 'http://'}${link.trim()}`);

          const parsed = tlds.parse(data.host);

          if (parsed && parsed.publicSuffix.split('.').every((tld) => api._botConfig.get('validation.link.tld').includes(tld))) {
            return true;
          }
        } catch (error) {
          return false;
        }
      }
    }
  }
  return false;
};

const isValidAd = arg => arg.startsWith('[') && arg.endsWith(']');

module.exports = {
  isNull,
  isNullOrUndefined,
  isLessThanOrEqualZero,
  isNullOrWhitespace,
  isValidNumber,
  isValidArray,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isBuffer,
  isType,
  isValidAd,
  isValidUrl
};
