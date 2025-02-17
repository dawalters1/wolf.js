import Base from './Base.js';

class GroupEventCreate extends Base {
  constructor (client) {
    super(client, 'group event create');
  }

  async process (body) {

  }
}

export default GroupEventCreate;
