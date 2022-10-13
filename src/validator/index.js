import { WOLFAPIError } from '../models/index.js';
import tlds from 'tldts';

// eslint-disable-next-line prefer-regex-literals
const TRIM_START_PUNC = new RegExp(/^\p{Punctuation}+/, 'gui');
// eslint-disable-next-line prefer-regex-literals
const TRIM_END_PUNC = new RegExp(/\p{Punctuation}+$/, 'gui');

const trimPunctuation = (string) => string?.replace(TRIM_START_PUNC, '').replace(TRIM_END_PUNC, '');

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

  throw new WOLFAPIError('type is not a valid typeof', { arg, type });
};

const isNull = (arg) => arg === null;
const isNullOrUndefined = (arg) => arg === null || arg === undefined;
const isNullOrWhitespace = (arg) => isNullOrUndefined(arg) || (typeof arg === 'string' && arg.trim().length === 0);
const isLessThanOrEqualZero = (arg) => isValidNumber(arg) && !(parseInt(arg) > 0);
const isLessThanZero = (arg) => isValidNumber(arg) && !(parseInt(arg) >= 0);
const isValidNumber = (arg, acceptDecimals = false) => (acceptDecimals ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/).test(arg);
const isValidArray = (arg) => Array.isArray(arg);
const isValidBoolean = (arg) => typeof arg === 'boolean' || (typeof arg === 'number' && (arg === 1 || arg === 0));
const isValidDate = (arg) => !isNaN(new Date(arg).getDate());
const isValidHex = (arg) => !isNullOrWhitespace(arg) && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/giu.test(`${arg.startsWith('#') ? '' : '#'}${arg}`);
const isValidEmoji = (arg) => !isNullOrWhitespace(arg) && /\p{Extended_Pictographic}/giu.text(arg);

const isEqual = (sideA, sideB) => {
  if (typeof sideA !== 'string') {
    return false;
  }

  if (typeof sideB !== 'string') {
    return false;
  }

  if (sideA === undefined && sideB === undefined) {
    return true;
  }

  if (sideA === undefined || sideB === undefined) {
    return false;
  }

  if (sideA === null && sideB === null) {
    return true;
  }

  if (sideA === null || sideB === null) {
    return false;
  }

  return sideA.toLocaleLowerCase().trim() === sideB.toLocaleLowerCase().trim();
};

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

  const validationConfig = client._botConfig.get('validation.links');

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

    if (!parsed || parsed.isIp) {
      return false;
    }

    if (
      !parsed.domain && !parsed.publicSuffix.split('.').every((tld) => validationConfig.tlds.includes(tld.toLowerCase()))) {
      return false;
    }

    return true;
  } catch (error) {
    // if something is malformed with provided data to URL it will throw an error
    return false;
  }
};

export { isNull };
export { isNullOrUndefined };
export { isLessThanOrEqualZero };
export { isNullOrWhitespace };
export { isValidNumber };
export { isValidArray };
export { isLessThanZero };
export { isValidBoolean };
export { isValidDate };
export { isType };
export { trimPunctuation };
export { isValidHex };
export { isValidEmoji };
export { isEqual };
export { isValidUrl };

export default {
  isNull,
  isNullOrUndefined,
  isLessThanOrEqualZero,
  isNullOrWhitespace,
  isValidNumber,
  isValidArray,
  isLessThanZero,
  isValidBoolean,
  isValidDate,
  isType,
  trimPunctuation,
  isValidHex,
  isValidEmoji,
  isEqual,
  isValidUrl
};
