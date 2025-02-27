import Base from './Base.js';

class ChannelOwner extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.hash = data?.hash;
  }
}

export default ChannelOwner;
