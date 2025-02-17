import Base from './Base.js';

class PresenceUpdate extends Base {
  constructor (client) {
    super(client, 'presence update');
  }

  async process (body) {

  }
}

export default PresenceUpdate;
