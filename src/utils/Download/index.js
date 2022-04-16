const validator = require('../../validator');
const superagent = require('superagent');

class Download {
  async file (url) {
    try {
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
    } catch (error) {
      error.internalErrorMessage = `api.utility${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.download${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.file(url=${JSON.stringify(url)})`;
      throw error;
    }
  }
}

module.exports = Download;
