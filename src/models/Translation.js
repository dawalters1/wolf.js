import Base from './Base.js';

class Translation extends Base {
  constructor (client, data) {
    super(client);
    this.languageId = data?.languageId;
    this.text = data?.text;
  }
}

export default Translation;
