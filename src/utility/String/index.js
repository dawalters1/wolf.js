import _ from 'lodash';
import validator from '../../validator/index.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import tlds from 'tldts';
import { ValidUrl } from '../../models/index.js';
import Base from '../../models/Base.js';

// eslint-disable-next-line prefer-regex-literals
const TRIM_START_PUNC = new RegExp(/^\p{Punctuation}+/, 'gui');

// eslint-disable-next-line prefer-regex-literals
const TRIM_END_PUNC = new RegExp(/\p{Punctuation}+$/, 'gui');

const trimPunctuation = (string) => {
  if (string) {
    return string.replace(TRIM_START_PUNC, '').replace(TRIM_END_PUNC, '');
  }

  return string;
};

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class StringUtility extends Base {
  replace (string, replacements) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    if (validator.isNullOrUndefined(replacements)) {
      throw new WOLFAPIError('amount cannot be null or undefined', {
        replacements
      });
    } else if (typeof replacements !== 'object') {
      throw new WOLFAPIError('replacements must be an object', {
        replacements
      });
    } else if (!Object.keys(replacements).length) {
      throw new WOLFAPIError('replacements contain at least 1 property', {
        replacements
      });
    }

    return Object.entries(replacements)
      .map((replacement) =>
        [
          ...string.matchAll(
            new RegExp(_.escapeRegExp(`{${replacement[0]}}`), 'g')
          )
        ].map((match) => ({
          startsAt: match.index,
          endsAt: match.index + match[0].length,
          replaceWith: replacement[1] || ''
        }))
      )
      .flat()
      .sort((a, b) => b.startsAt - a.startsAt)
      .reduce(
        (result, value) =>
          replaceRange(result, value.startsAt, value.endsAt, value.replaceWith),
        string
      );
  }

  isEqual (sideA, sideB) {
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
  }

  chunk (string, length = 1000, splitChar = '\n', joinChar = '\n') {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('length cannot be null or undefined', {
        length
      });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('length must be a valid number', { length });
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new WOLFAPIError('length cannot be less than or equal to 0', {
        length
      });
    }

    if (validator.isNullOrUndefined(splitChar)) {
      throw new WOLFAPIError('splitChar cannot be null or undefined', {
        splitChar
      });
    }

    if (validator.isNullOrUndefined(joinChar)) {
      throw new WOLFAPIError('joinChar cannot be null or undefined', {
        joinChar
      });
    }

    if (string.length <= length) {
      return [string];
    }

    const lines = string.split(splitChar).filter(Boolean);

    if (lines.length === 0) {
      throw new Error(
        `string is longer than ${length} characters and contains no ${splitChar} characters`
      );
    }

    return lines.reduce((result, value) => {
      if (result.length > 0) {
        if (result.slice(-1)[0].length + value.length + 1 <= length) {
          result[result.length - 1] = `${
            result.slice(-1)[0]
          }${joinChar}${value}`;

          return result;
        }
      }
      result.push(value.trim());

      return result;
    }, []);
  }

  trimAds (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    const matches = [...string.matchAll(/\[([^\][]*)]/g)]
      .filter(Boolean)
      .filter((match) => match[0].split('\n').length === 1);

    if (matches.length === 0) {
      return string;
    }

    for (const match of matches.reverse()) {
      string =
        string.substring(0, match.index) +
        match[1] +
        string.substring(match.index + match[0].length);
    }

    // Loop check to prevent [[[]]]
    return this.trimAds(string);
  }

  getValidUrl (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    if (!string) {
      return undefined;
    }

    if (string.startsWith('[') && string.endsWith(']')) {
      return undefined;
    }

    if (!(string.includes('.') || string.includes(':'))) {
      return undefined;
    }

    let sanitised = trimPunctuation(string).trim();
    const validationConfig = this.client._botConfig.get('validation.links');
    const protocol = validationConfig.protocols
      .sort((a, b) => b.length - a.length)
      .find((prot) => sanitised.toLowerCase().startsWith(prot));

    sanitised = sanitised.slice(protocol?.length ?? 0);

    const domainArgs = sanitised
      .split(protocol === 'wolf://' ? '/' : /[.:]/g)
      .filter(Boolean);

    if (protocol === 'wolf://' && domainArgs.length) {
      return new ValidUrl(sanitised);
    }

    if (domainArgs.length < 2) {
      return undefined;
    }

    try {
      const data = new URL(`${protocol || 'http://'}${sanitised}`);
      const parsed = tlds.parse(data.host);

      if (!parsed || parsed.isIp) {
        return undefined;
      }

      if (
        !parsed.domain &&
        !parsed.publicSuffix
          .split('.')
          .every((tld) => validationConfig.tlds.includes(tld.toLowerCase()))
      ) {
        return undefined;
      }

      return new ValidUrl(trimPunctuation(string).trim(), parsed.hostname);
    } catch (error) {
      // if something is malformed with provided data to URL it will throw an error
      return undefined;
    }
  }

  getAds (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    return (
      [
        ...string.matchAll(
          /(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\d|\p{Letter}))/gu
        )
      ] || []
    ).map((result) => ({
      start: result.index,
      end: result.index + result[0].length,
      value: result[2],
      ad: result[0]
    }));
  }

  sanitise (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', {
        string
      });
    }

    return _.deburr(string);
  }
}

export default StringUtility;
