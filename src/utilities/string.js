import _ from 'lodash';
import Ad from '../entities/ad.js';
import BaseUtility from './BaseUtility.js';
import Link from '../entities/link.js';
import urlRegexSafe from 'url-regex-safe';
import { validate } from '../validation/Validation.js';

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url.startsWith('http')
      ? url
      : `http://${url}`);

    const isLocalHost = (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1');

    return !isLocalHost;
  } catch {
    return false;
  }
};

export default class StringUtility extends BaseUtility {
  chunk (string, length = 1000, splitChar = '\n', joinChar = '\n') {
    const normalisedLength = this.normaliseNumber(length);

    if (string.length <= normalisedLength) {
      return [string];
    }

    const lines = string.split(splitChar).filter(Boolean);

    if (lines.length === 0) {
      throw new Error(`String is longer than ${normalisedLength} characters and contains no ${splitChar} characters`);
    }

    return lines.reduce((result, line) => {
      const lastLine = result[result.length - 1];

      if (lastLine && (lastLine.length + line.length + 1 <= normalisedLength)) {
        result[result.length - 1] = `${lastLine}${joinChar}${line}`;
      } else {
        result.push(line.trim());
      }

      return result;
    }, []);
  }

  getAds (string) {
    validate(string, this, this.getAds)
      .isNotNullOrUndefined();

    return [...string.matchAll(/(?<![\p{Letter}\d])\[((?:[^[\]])+?)\](?![\p{Letter}\d])/gu)]
      .map(ad =>
        new Ad(this.client, ad)
      );
  }

  getLinks (string) {
    validate(string, this, this.getLinks)
      .isNotNullOrUndefined();

    const urls = string.match(urlRegexSafe({ localhost: true, returnString: false })) || [];

    if (!urls.length) { return []; }

    const sortedUrls = urls.map(url => url.replace(/\.+$/, '')).sort((a, b) => b.length - a.length);

    const results = [];

    for (const url of sortedUrls) {
      const pattern = new RegExp(`(?:(?<!\\d|\\p{Letter}))(${_.escapeRegExp(url)})(?:(?!\\d|\\p{Letter}))`, 'gu');

      for (const match of string.matchAll(pattern)) {
        if (results.some(existing => existing.index === match.index)) { continue; }

        if (!isValidUrl(match[1])) { continue; }

        results.push(match);
      }
    }

    return results.map(
      (match) =>
        new Link(this.client,
          {
            start: match.index,
            end: match.index + match[1].length,
            link: match[1]
          }
        )
    );
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

    return this.sanitise(stringA).trim() === this.sanitise(stringB).trim();
  }

  replace (string, replacements) {
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
    validate(string, this, this.sanitise)
      .isNotNullOrUndefined();

    return string
      .normalize('NFD') // Handles Latin accents
      .replace(/[\u0300-\u036f]/g, '') // Remove Latin combining marks
      .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // Remove Arabic diacritics
      .replace(/ç/gi, 'c')
      .replace(/ğ/gi, 'g')
      .replace(/ı|i/gi, 'i') // Handles both dotted and dotless I
      .replace(/ö/gi, 'o')
      .replace(/ş/gi, 's')
      .replace(/ü/gi, 'u')
      .toLowerCase();
  }

  trimAds (string) {
    validate(string, this, this.trimAds)
      .isNotNullOrUndefined();

    const ads = this.getAds(string);

    return ads.reverse().reduce((result, match) => result.substring(0, match.start) + match[3] + result.substring(match.end), string);
  }
}
