import _ from 'lodash';
import Ad from '../entities/ad.js';
import { validate } from '../validator/index.js';

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

class StringUtility {
  constructor (client) {
    this.client = client;
  }

  chunk (string, length = 1000, splitChar = '\n', joinChar = '\n') {
    { // eslint-disable-line no-lone-blocks
      validate(string)
        .isTypeOf('string', `StringUtility.chunk() parameter, string: ${string} is not type of string`)
        .isNotNullOrUndefined(`StringUtility.chunk() parameter, string: ${string} is null or undefined`)
        .isNotEmptyOrWhitespace(`StringUtility.chunk() parameter, string: ${string} is empty or whitespace`);

      validate(length)
        .isGreaterThan(0, `StringUtility.chunk() parameter, length: ${length} must be lstringer than 0`);

      validate(splitChar)
        .isNotNullOrUndefined(`StringUtility.chunk() parameter, splitChar: ${splitChar} is null or undefined`)
        .isNotEmptyOrWhitespace(`StringUtility.chunk() parameter, splitChar: ${splitChar} is empty or whitespace`);

      validate(joinChar)
        .isNotNullOrUndefined(`StringUtility.chunk() parameter, joinChar: ${joinChar} is null or undefined`)
        .isNotEmptyOrWhitespace(`StringUtility.chunk() parameter, joinChar: ${joinChar} is empty or whitespace`);
    }

    if (string.length <= length) {
      return [string];
    }

    const lines = string.split(splitChar).filter(Boolean);

    if (lines.length === 0) {
      throw new Error(`String is longer than ${length} characters and contains no ${splitChar} characters`);
    }

    return lines.reduce((result, line) => {
      const lastLine = result[result.length - 1];

      if (lastLine && (lastLine.length + line.length + 1 <= length)) {
        result[result.length - 1] = `${lastLine}${joinChar}${line}`;
      } else {
        result.push(line.trim());
      }

      return result;
    }, []);
  }

  getAds (string) {
    { // eslint-disable-line no-lone-blocks
      validate(string)
        .isTypeOf('string', `StringUtility.getAds() parameter, string: ${string} is not type of string`)
        .isNotNullOrUndefined(`StringUtility.getAds() parameter, string: ${string} is null or undefined`)
        .isNotEmptyOrWhitespace(`StringUtility.getAds() parameter, string: ${string} is empty or whitespace`);
    }

    return [...string.matchAll(/(?<![\p{Letter}\d])\[((?:[^[\]])+?)\](?![\p{Letter}\d])/gu)].map(ad => new Ad(this.client, ad));
  }

  isEqual (stringA, stringB) {
    if (typeof stringA !== 'string' || typeof stringB !== 'string') {
      return false;
    }

    if (stringA === undefined && stringA === undefined) {
      return true;
    }

    if (stringA === undefined || stringB === undefined) {
      return false;
    }

    if (stringA === null && stringB === null) {
      return true;
    }

    if (stringA === null || stringB === null) {
      return false;
    }

    return this.sanitise(stringA) === this.sanitise(stringB);
  }

  replace (string, replacements) {
    { // eslint-disable-line no-lone-blocks
      validate(string)
        .isTypeOf('string', `StringUtility.replace() parameter, string: ${string} is not type of string`)
        .isNotNullOrUndefined(`StringUtility.replace() parameter, string: ${string} is null or undefined`)
        .isNotEmptyOrWhitespace(`StringUtility.replace() parameter, string: ${string} is empty or whitespace`);
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

  sanitise (string) {
    { // eslint-disable-line no-lone-blocks
      validate(string)
        .isTypeOf('string', `StringUtility.replace() parameter, string: ${string} is not type of string`)
        .isNotNullOrUndefined(`StringUtility.replace() parameter, string: ${string} is null or undefined`);
    }

    return string
      .normalize('NFD') // Handles Latin accents
      .replace(/[\u0300-\u036f]/g, '') // Remove Latin combining marks
      .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove Arabic diacritics
      .toLowerCase();
  }

  trimAds (string) {
    { // eslint-disable-line no-lone-blocks
      validate(string)
        .isTypeOf('string', `StringUtility.replace() parameter, string: ${string} is not type of string`)
        .isNotNullOrUndefined(`StringUtility.replace() parameter, string: ${string} is null or undefined`);
    }

    const ads = this.getAds(string);

    return ads.reverse().reduce((result, match) => result.substring(0, match.start) + match[3] + result.substring(match.end), string);
  }
}

export default StringUtility;
