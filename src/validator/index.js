import { WOLFAPIError } from '../models/index.js';
import tlds from 'tldts';

// eslint-disable-next-line prefer-regex-literals
const TRIM_START_PUNC = new RegExp(/^[\p{Punctuation}|\p{Symbol}]+/, 'gui');
// eslint-disable-next-line prefer-regex-literals
const TRIM_END_PUNC = new RegExp(/[\p{Punctuation}|\p{Symbol}]+$/, 'gui');

const trimPunctuation = (string) => string?.replace(TRIM_START_PUNC, '').replace(TRIM_END_PUNC, '').trim();

const isType = (arg, type) => {
  const types = ['string', 'function', 'object', 'bigint', 'symbol', 'number', 'boolean', 'undefined'];

  if (!types.includes(type)) {
    throw new WOLFAPIError('type is not a valid typeof', { arg, type });
  }

  return (String)(typeof arg) === type;
};

const isNull = (arg) => arg === null;
const isUndefined = (arg) => arg === undefined;
const isNullOrUndefined = (arg) => arg === null || arg === undefined;
const isNullOrWhitespace = (arg) => isNullOrUndefined(arg) || (typeof arg === 'string' && !arg.trim().length);
const isLessThanOrEqualZero = (arg) => isValidNumber(arg) && !(parseInt(arg) > 0);
const isLessThanZero = (arg) => isValidNumber(arg) && !(parseInt(arg) >= 0);
const isValidNumber = (arg, acceptDecimals = false) => (acceptDecimals ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/).test(arg);
const isValidBoolean = (arg) => typeof arg === 'boolean' || (typeof arg === 'number' && (arg === 1 || !arg));
const isValidDate = (arg) => !isNaN(new Date(arg).getDate());
const isValidHex = (arg) => !isNullOrWhitespace(arg) && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/giu.test(`${arg.startsWith('#') ? '' : '#'}${arg}`);
const isValidEmoji = (arg) => !isNullOrWhitespace(arg) && /\p{Extended_Pictographic}/giu.test(arg);
const isGreaterThanZero = (arg) => isValidNumber(arg) && parseInt(arg) > 0;
const isGreaterThanOrEqualZero = (arg) => isValidNumber(arg) && parseInt(arg) >= 0;

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

  let sanitised = trimPunctuation(arg);

  const validationConfig = client._frameworkConfig.get('validation.links');

  const protocol = validationConfig.protocols
    .sort((a, b) => b.length - a.length)
    .find((prot) => sanitised.toLowerCase().startsWith(prot));

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

const exports = {
  isNull,
  isUndefined,
  isNullOrUndefined,
  isLessThanOrEqualZero,
  isGreaterThanOrEqualZero,
  isGreaterThanZero,
  isNullOrWhitespace,
  isValidNumber,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isType,
  trimPunctuation,
  isValidHex,
  isValidEmoji,
  isValidUrl
};

export {
  isNull,
  isUndefined,
  isNullOrUndefined,
  isLessThanOrEqualZero,
  isGreaterThanOrEqualZero,
  isGreaterThanZero,
  isNullOrWhitespace,
  isValidNumber,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isType,
  trimPunctuation,
  isValidHex,
  isValidEmoji,
  isValidUrl,

  exports as default
};
