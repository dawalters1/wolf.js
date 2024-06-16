import _ from 'lodash';
import validator, { isValidUrl } from '../../validator/index.js';
import WOLFAPIError from '../../models/WOLFAPIError.js';
import models from '../../models/index.js';
import urlRegexSafe from 'url-regex-safe';

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class StringUtility {
  constructor (client) {
    this.client = client;
  }

  /**
   * Replace placeholders in a string
   * @param {String} string
   * @param {{ [key: String]: String | Number }} replacements
   * @returns {String}
   */
  replace (string, replacements) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    if (validator.isNullOrUndefined(replacements)) {
      throw new WOLFAPIError('amount cannot be null or undefined', { replacements });
    } else if (typeof replacements !== 'object') {
      throw new WOLFAPIError('replacements must be an object', { replacements });
    } else if (!Object.keys(replacements).length) {
      throw new WOLFAPIError('replacements contain at least 1 property', { replacements });
    }

    return Object.entries(replacements)
      .map((replacement) => [...string.matchAll(new RegExp(_.escapeRegExp(`{${replacement[0]}}`), 'g'))]
        .map((match) =>
          (
            {
              startsAt: match.index,
              endsAt: match.index + match[0].length,
              replaceWith: replacement[1] ?? ''
            }
          )
        )
      )
      .flat()
      .sort((a, b) => b.startsAt - a.startsAt)
      .reduce((result, value) => replaceRange(result, value.startsAt, value.endsAt, value.replaceWith), string);
  }

  /**
   * Check if two strings are equal
   * @param {String} sideA
   * @param {String} sideB
   * @returns {boolean}
   */
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

  /**
   * Chunk a string
   * @param {String} string
   * @param {Number} length
   * @param {String} splitChar
   * @param {String} joinChar
   * @returns {Array<String>}
   */
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

    if (!lines.length) {
      throw new WOLFAPIError(`string is longer than ${length} characters and contains no ${splitChar} characters`, { length, splitChar });
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
  }

  /**
   * Trim all ads from a string
   * @param {String} stringA
   * @returns {String}
   */
  trimAds (stringA) {
    if (validator.isNullOrUndefined(stringA)) {
      throw new WOLFAPIError('string cannot be null or undefined', { stringA });
    }

    const matches = [...stringA.matchAll(/((\[+)(.+?)(\]+))/gus)]
      .filter(Boolean);

    if (!matches.length) {
      return stringA;
    }

    return matches.reverse().reduce((result, match) => {
      if (match[2].length === match[4].length) {
        return result.substring(0, match.index) + match[3] + result.substring(match.index + match[0].length);
      }

      // If square brackets are uneven only remove the ones that have matching closing bracket
      return result.substring(0, match.index) + `${[...Array(match[2].length > match[4].length ? Math.abs(match[2].length - match[4].length) : 0).keys()].map(() => '[').join('')}${match[3]}${[...Array(match[2].length > match[4].length ? 0 : Math.abs(match[2].length - match[4].length)).keys()].map(() => ']').join('')}` + result.substring(match.index + match[0].length);
    }, stringA);
  }

  /**
   * Get all links in a string
   * @param string
   * @returns {Array<Link>}
   */
  getLinks (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    return string.match(urlRegexSafe({ localhost: true, returnString: false }))?.map((url) => url.replace(/\.+$/, ''))
      .sort((a, b) => b.length - a.length)
      .reduce((results, url) => {
        results.push(...[...string.matchAll(new RegExp(`(?:(?<!\\d|\\p{Letter}))(${_.escapeRegExp(url)})(?:(?!\\d|\\p{Letter}))`, 'gu'))].filter((match) => !results.some((existingMatch) => existingMatch.index === match.index) && isValidUrl(this.client, match[0])));

        return results;
      }, [])
      .map((url) =>
        new models.Link(
          this.client,
          {
            start: url.index,
            end: url.index + url[0].length,
            link: url[0]
          }
        )
      ) ?? [];
  }

  /**
   * Get all ads in a string
   * @param {String} string
   * @returns {Array<Ad>}
   */
  getAds (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    return [
      ...string.matchAll(
        /(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\(.+?\)|\d|\p{Letter}))/gus
      )
    ]?.map((ad) =>
      new models.Ad(
        this.client,
        {
          start: ad.index,
          end: ad.index + ad[0].length,
          ad: ad[0],
          channelName: ad[2].trim()
        }
      )
    ) ?? [];
  }

  /**
   * Replaces all accented letters with non-accented letters
   * @param {String} string
   * @returns {string}
   */
  sanitise (string) {
    if (validator.isNullOrUndefined(string)) {
      throw new WOLFAPIError('string cannot be null or undefined', { string });
    }

    return _.deburr(string);
  }
}

export default StringUtility;
