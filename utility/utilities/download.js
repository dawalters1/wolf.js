const BaseUtility = require('../BaseUtility');
const validator = require('@dawalters1/validator');
const superagent = require('superagent');

const download = async (url) => superagent.get(url)
  .buffer(true).parse(superagent.parse.image)
  .then(res => res.body);

module.exports = class Download extends BaseUtility {
  constructor (api) {
    super(api, 'download');
  }

  _func () {
    return {
      file: (...args) => this.file(...args)
    };
  }

  async file (url) {
    if (typeof (arg) !== 'string') {
      throw new Error('argument must be a string');
    } else if (validator.isNullOrWhitespace(url)) {
      throw new Error('url cannot be null or empty');
    }
    return await download(url);
  }
};
