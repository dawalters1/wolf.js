const request = require('request-promise');
const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');

const download = async (url, type) => {
  return await request({
    method: 'GET',
    url,
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 3000
  });
};

module.exports = class Download extends BaseUtility {
  constructor (bot) {
    super(bot, 'download');
  }

  _func () {
    return {
      file: (...args) => this.file(...args)
    };
  }

  async file (url) {
    try {
      if (typeof (arg) !== 'string') {
        throw new Error('argument must be a string');
      } else if (validator.isNullOrWhitespace(url)) {
        throw new Error('url cannot be null or empty');
      }
      return await download(url);
    } catch (error) {
      error.method = `Utility/utilties/download/file(url = ${JSON.stringify(url)})`;
      throw error;
    }
  }
};
