import Base from './Base.js';
import models from './index.js';
import validator from '../validator/index.js';

class CharmSelected extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.position = data?.position;
  }

  async charm () {
    return await this.client.charm.getById(this.charmId);
  }

  async deselect () {
    return await this.client.charm.set();
  }

  toJSON () {
    return {
      charmId: this.charmId,
      position: this.position
    };
  }
}

export default CharmSelected;
