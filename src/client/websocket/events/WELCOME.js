import Base from './Base.js';

class Welcome extends Base {
  constructor (client) {
    super(client, 'welcome');
  }

  async process (body) {

  }
}

export default Welcome;
