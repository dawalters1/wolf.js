import Base from './Base.js';

class Translation extends Base {
  constructor (client, data) {
    super(client);
    this.languageId = data?.languageId;
    this.text = data?.text;
  }

  toJSON () {
    return {
      languageId: this.languageId,
      text: this.text
    };
  }
}

export default Translation;
