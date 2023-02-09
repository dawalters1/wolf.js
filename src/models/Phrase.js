import Base from './Base.js';

class Phrase extends Base {
  constructor (client, data) {
    super(client);
    this.name = data?.name;
    this.value = data?.value;
    this.language = data?.language;
  }
}

export default Phrase;
