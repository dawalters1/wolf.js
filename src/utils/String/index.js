const validator = require('../../validator');

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

function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class String {
  constructor (api) {
    this._api = api;
  }

  replace (string, replacements) {
    try {
      if (typeof (string) !== 'string') {
        throw new Error('string must be type string');
      } else if (validator.isNullOrWhitespace(string)) {
        throw new Error('string cannot be null or empty');
      }

      const mapped = Object.fromEntries(Object.entries(replacements).map(([k, v]) => [k, v]));

      if (mapped.length === 0 || Object.entries(mapped).some((value) => value.length !== 2)) {
        throw new Error('replacements object is invalid');
      }

      const replacementLocations = Object.entries(replacements).map((replacement) => [...string.matchAll(new RegExp(escapeRegExp(`{${replacement[0]}}`), 'g'))].map((match) => (
        {
          startsAt: match.index,
          endsAt: match.index + match[0].length,
          replaceWith: replacement[1] || ''
        }
      ))).flat();

      return replacementLocations.sort((a, b) => b.startsAt - a.startsAt).reduce((result, value) => replaceRange(result, value.startsAt, value.endsAt, value.replaceWith), string);
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().replace(string=${JSON.stringify(string)}, replacements=${JSON.stringify(replacements)})`;
      throw error;
    }
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

  chunk (string, max = 1000, splitChar = '\n', joinChar = '\n') {
    try {
      if (typeof (string) !== 'string') {
        throw new Error('string must be type string');
      } else if (validator.isNullOrWhitespace(string)) {
        throw new Error('string cannot be null or empty');
      }

      if (validator.isNullOrUndefined(max)) {
        throw new Error('max cannot be null or undefined');
      } else if (!validator.isValidNumber(max)) {
        throw new Error('max must be a valid number');
      } else if (validator.isLessThanOrEqualZero(max)) {
        throw new Error('max cannot be less than or equal to 0');
      }

      if (string.length <= max) {
        return [string];
      }

      if (typeof (splitChar) !== 'string') {
        throw new Error('splitChar must be a string');
      }

      if (typeof (joinChar) !== 'string') {
        throw new Error('joinChar must be a string');
      }

      const lines = string.split(splitChar).filter(Boolean);

      if (lines.length === 0) {
        throw new Error(`string is longer than ${max} characters and contains no ${splitChar} characters`);
      }

      return lines.reduce((result, value) => {
        if (result.length > 0) {
          if (result.slice(-1)[0].length + value.length + 1 <= max) {
            result[result.length - 1] = `${result.slice(-1)[0]}${joinChar}${value}`;
            return result;
          }
        }

        result.push(value.trim());
        return result;
      }, []);
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().chunk(string=${JSON.stringify(string)}, max=${JSON.stringify(max)}, splitChar=${JSON.stringify(splitChar)}, joinChar=${JSON.stringify(joinChar)})`;
      throw error;
    }
  };

  trimAds (string) {
    try {
      if (typeof (string) !== 'string') {
        throw new Error('name must be a string');
      } else if (validator.isNullOrWhitespace(string)) {
        throw new Error('name cannot be null or empty');
      }

      if (!string) {
        return string;
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
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().trimAds(string=${JSON.stringify(string)})`;
      throw error;
    }
  }

  getValidUrl (url) {
    try {
      if (typeof (url) !== 'string') {
        throw new Error('url must be a string');
      } else if (validator.isNullOrUndefined(url)) {
        throw new Error('url cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(url)) {
        throw new Error('url cannot be null or empty');
      }
      if (url && !(url.startsWith('[') && url.endsWith(']'))) {
        if ((url.includes('.') || url.includes(':'))) {
          let link = trimPunctuation(url.toLowerCase());

          const protocol = this._api._botConfig.get('validation.link.protocols').sort((a, b) => b.length - a.length).find((proto) => url.toLowerCase().startsWith(proto));

          if (protocol) {
            link = link.slice(protocol ? protocol.length : 0);
          }

          const args = link.split(protocol === 'wolf://' ? '/' : /[.:]/g).filter(Boolean);

          if (protocol === 'wolf://') {
            if (args.length > 0) {
              return {
                url,
                hostname: undefined
              };
            }

            return null;
          }

          if (args.length >= 2) {
            try {
              const data = new URL(`${protocol || 'http://'}${link.trim()}`);

              const parsed = tlds.parse(data.host);

              if (parsed && parsed.publicSuffix.split('.').every((tld) => this._api._botConfig.get('validation.link.tld').includes(tld))) {
                return {
                  url,
                  hostname: parsed.hostname
                };
              }
            } catch (error) {
              return null;
            }
          }
        }
      }
      return null;
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().getValidUrl(string=${JSON.stringify(url)})`;
      throw error;
    }
  }

  getAds (arg) {
    try {
      if (typeof (arg) !== 'string') {
        throw new Error('url must be a string');
      } else if (validator.isNullOrUndefined(arg)) {
        throw new Error('url cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(arg)) {
        throw new Error('url cannot be null or empty');
      }

      return ([...arg.matchAll(/(?:(?<=^|\s+|\p{Punctuation}|\p{Extended_Pictographic}))(\[(.+?)\])(?:(?=$|\s+|\p{Punctuation}|\p{Extended_Pictographic}))/gu)] || []);
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().getAds(string=${JSON.stringify(arg)})`;
      throw error;
    }
  }
}

module.exports = String;
