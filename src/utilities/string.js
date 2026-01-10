import _ from 'lodash';
import Ad from '../../../../entities/ad.js';
import BaseUtility from './BaseUtility.js';
import Link from '../../../../entities/link.js';
import urlRegexSafe from 'url-regex-safe';
import { validate } from '../validator/index.js';

function replaceRange (string, start, end, substitute) {
  return string.substring(0, start) + substitute + string.substring(end);
}

const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/gui;
const isValidUrl = (url) => urlRegex.test(url);

export default class StringUtility extends BaseUtility {
  chunk (string, length = 1000, splitChar = '\n', joinChar = '\n') {

  }

  getAds (string) {

  }

  getLinks (string) {

  }

  isEqual (stringA, stringB) {

  }

  replace (string, replacements) {

  }

  sanitise (string) {

  }

  trimAds (string) {

  }
}
