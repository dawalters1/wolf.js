const _ = require('lodash');
const validator = require('../../validator');

const WOLFAPIError = require('../../models/WOLFAPIError');

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

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class StringUtility {
  replace (string, replacements) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    if (validator.isNullOrUndefined(replacements)) {
      throw new WOLFAPIError('amount cannot be null or undefined', { replacements });
    } else if (typeof object !== 'object') {
      throw new WOLFAPIError('replacements must be an object', { replacements });
    } else if (!Object.keys(replacements).length) {
      throw new WOLFAPIError('replacements contain at least 1 property', { replacements });
    }

    return Object.entries(replacements)
      .map((replacement) => [...string.matchAll(new RegExp(_.escapeRegExp(`{${replacement[0]}}`), 'g'))]
        .map((match) => (
          {
            startsAt: match.index,
            endsAt: match.index + match[0].length,
            replaceWith: replacement[1] || ''
          }
        )))
      .flat()
      .sort((a, b) => b.startsAt - a.startsAt)
      .reduce((result, value) => replaceRange(result, value.startsAt, value.endsAt, value.replaceWith), string);
  }

  isEqual (sideA, sideB) {
    if (typeof (sideA) !== 'string') {
      return false;
    }

    if (typeof (sideB) !== 'string') {
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
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    if (validator.isNullOrUndefined(length)) {
      throw new WOLFAPIError('length cannot be null or undefined', { length });
    } else if (!validator.isValidNumber(length)) {
      throw new WOLFAPIError('length must be a valid number', { length });
    } else if (validator.isLessThanOrEqualZero(length)) {
      throw new WOLFAPIError('length cannot be less than or equal to 0', { length });
    }

    if (validator.isNullOrUndefined(splitChar)) {
      throw new WOLFAPIError('splitChar cannot be null or undefined', { splitChar });
    }

    if (validator.isNullOrUndefined(joinChar)) {
      throw new WOLFAPIError('joinChar cannot be null or undefined', { joinChar });
    }

    if (string.length <= length) {
      return [string];
    }

    const lines = string.split(splitChar).filter(Boolean);

    if (lines.length === 0) {
      throw new Error(`string is longer than ${length} characters and contains no ${splitChar} characters`);
    }

    return lines.reduce((result, value) => {
      if (result.length > 0) {
        if (result.slice(-1)[0].length + value.length + 1 <= length) {
          result[result.length - 1] = `${result.slice(-1)[0]}${joinChar}${value}`;
          return result;
        }
      }

      result.push(value.trim());
      return result;
    }, []);
  };

  trimAds (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    const matches = [...string.matchAll(/\[([^\][]*)]/g)].filter((Boolean)).filter((match) => match[0].split('\n').length === 1);

    if (matches.length === 0) {
      return string;
    }

    for (const match of matches.reverse()) {
      string = string.substring(0, match.index) + match[1] + string.substring(match.index + match[0].length);
    }

    // Loop check to prevent [[[]]]
    return this.trimAds(string);
  }

  getValidUrl (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    if (string && !(string.startsWith('[') && string.endsWith(']'))) {
      if ((string.includes('.') || string.includes(':'))) {
        let link = trimPunctuation(string.toLowerCase());

        const protocol = this._api._botConfig.get('validation.link.protocols').sort((a, b) => b.length - a.length).find((proto) => string.toLowerCase().startsWith(proto));

        if (protocol) {
          link = link.slice(protocol ? protocol.length : 0);
        }

        const args = link.split(protocol === 'wolf://' ? '/' : /[.:]/g).filter(Boolean);

        if (protocol === 'wolf://') {
          if (args.length > 0) {
            return {
              url: string,
              hostname: undefined
            };
          }

          return null;
        }

        if (args.length >= 2) {
          try {
            const data = new URL(`${protocol || 'http://'}${link.trim()}`);

            const parsed = tlds.parse(data.host);

            if (parsed) {
              if (parsed.isIp) {
                return null;
              }

              if (parsed.domain && parsed.publicSuffix.split('.').every((tld) => this._api._botConfig.get('validation.link.tld').includes(tld))) {
                return {
                  url: string,
                  hostname: parsed.hostname
                };
              }
            }
            return null;
          } catch (error) {
            return null;
          }
        }
      }
    }
    return null;
  }

  getAds (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }
    return ([...string.matchAll(/(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\d|\p{Letter}))/gu)] || []);
  }

  sanitise (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    return _.deburr(string);
  }
}

module.exports = StringUtility;
