const validator = require('../../validator');

const PUNCTUATION_REGEX = /[/"()&*$￥^+=`~<>{}[]|-!#%,:;@¡§«¶·»¿;·՚-՟։֊؉،॥॰෴๏๚๛༄-༒༔༺-༽྅჻፠-፨᐀᙭᙮។-៖៘-៚‧‰-⁃⁅-⁑⁓-⁞⁽⁾₍₎、〃〈-【】〔-〟〰〽゠・﴾﴿︐-︙︰-﹒﹔-﹡﹣﹨﹪﹫！-＃％-＊，-／：；？＠［-］＿｛｝｟-･〔〕《》]/;

function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      return Object.entries(mapped).reduce((result, value) => result.replace(new RegExp(escapeRegExp(`{${value[0]}}`), 'g'), value[1].toString()), string);
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
      } else if (validator.isValidNumber(max)) {
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

      if (lines === 0) {
        throw Error(`string is longer than ${max} characters and contains no ${splitChar} characters`);
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

      const matches = [...string.matchAll(/\[([^\][]*)]/g)];

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

  isValidUrl (url) {
    try {
      if (!url || (!url.includes('.') && !url.includes(':'))) {
        return false;
      }

      let protocol = this._api._botConfig.validation.link.protocols.find((proto) => url.toLowerCase().startsWith(proto));

      if (!protocol) {
        protocol = 'http://';
        url = `${protocol}${url}`;
      }

      if (!url.slice(protocol.length).startsWith('www.')) {
        url = `${protocol}www.${url.slice(protocol.length)}`;
      }

      while (true) {
        const lastCharacter = url.slice(-1);

        if (lastCharacter.match(PUNCTUATION_REGEX)) {
          url = url.slice(0, url.length - 1);
        } else {
          break;
        }
      }

      try {
        const data = new URL(url);

        if (data.hostname.includes('.')) {
          const tld = data.hostname.split('.').pop();

          if (!this._api._botConfig.validation.link.tld.includes(tld)) {
            return false;
          }

          return true;
        } else if (data.host.includes(':') && data.port) {
          return true;
        }

        return false;
      } catch (error) {
        return false;
      }
    } catch (error) {
      error.internalErrorMessage = `api.utility().string().isValidUrl(url=${JSON.stringify(url)})`;
      throw error;
    }
  };
}

module.exports = String;
