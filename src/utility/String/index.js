const _ = require('lodash');

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

  chunk (string, max = 1000, splitChar = '\n', joinChar = '\n') {
    if (string.length <= max) {
      return [string];
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
  };

  trimAds (string) {
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
  }

  getValidUrl (url) {
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

            if (parsed) {
              if (parsed.isIp) {
                return null;
              }

              if (parsed.domain && parsed.publicSuffix.split('.').every((tld) => this._api._botConfig.get('validation.link.tld').includes(tld))) {
                return {
                  url,
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

  getAds (arg) {
    return ([...arg.matchAll(/(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\d|\p{Letter}))/gu)] || []);
  }

  sanitise (arg) {
    return _.deburr(arg);
  }
}

module.exports = StringUtility;
