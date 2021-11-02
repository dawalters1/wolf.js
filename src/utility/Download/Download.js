const validator = require('../../validator');
const superagent = require('superagent');

class Download {
  constructor (api) {
    this._api = api;
  }

  /**
   * Download a file as a buffer
   * @param {STRING} url - The url you want to download
   * @returns {Buffer} The file buffer
   */
  async file (url) {
    if (typeof (url) !== 'string') {
      throw new Error('argument must be a string');
    } else if (validator.isNullOrWhitespace(url)) {
      throw new Error('url cannot be null or empty');
    }
    return await superagent
      .get(url)
      .buffer(true)
      .parse(superagent.parse.image)
      .then(res => res.body);
  }
}

module.exports = Download;
