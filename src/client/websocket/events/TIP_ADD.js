import Base from './Base.js';

class TipAdd extends Base {
  constructor (client) {
    super(client, 'tip add');
  }

  async process (body) {

  }
}

export default TipAdd;
