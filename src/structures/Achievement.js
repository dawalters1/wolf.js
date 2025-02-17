import Base from './Base.js';

class Achievement extends Base {
  constructor (client, data) {
    super(client);

    // Body

    this.exists = Object.keys(data) > 1;
  }
}

export default Achievement;
