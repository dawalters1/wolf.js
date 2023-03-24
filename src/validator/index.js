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

const isValidUrl = (client, arg) => {
  if (!arg) {
    return false;
  }

  if (typeof arg !== 'string') {
    return false;
  }

  if (arg.startsWith('[') && arg.endsWith(']')) {
    return false;
  }

  if (!(arg.includes('.') || arg.includes(':'))) {
    return false;
  }

  let sanitised = trimPunctuation(arg).trim();

  const validationConfig = client._botConfig.get('validation.link');

  const protocol = validationConfig.protocols.sort((a, b) => b.length - a.length).find((prot) => sanitised.toLowerCase().startsWith(prot));

  sanitised = sanitised.slice(protocol?.length ?? 0);

  const domainArgs = sanitised.split(protocol === 'wolf://' ? '/' : /[.:]/g).filter(Boolean);

  if (protocol === 'wolf://' && domainArgs.length) {
    return true;
  }

  if (domainArgs.length < 2) {
    return false;
  }

  try {
    const data = new URL(`${protocol || 'http://'}${sanitised}`);
    const parsed = tlds.parse(data.host);

    if (!parsed) {
      return false;
    }

    if (parsed.isIp) {
      return !!protocol;
    }

    if (!parsed.isIcann) {
      return false;
    }

    if (!parsed.domain && !parsed.publicSuffix.split('.').every((tld) => validationConfig.tlds.includes(tld.toLowerCase()))) {
      return false;
    }

    return true;
  } catch (error) {
    // if something is malformed with provided data to URL it will throw an error
    return false;
  }
};
const isValidAd = arg => arg.startsWith('[') && arg.endsWith(']') && arg.split('\n').length === 1;

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
