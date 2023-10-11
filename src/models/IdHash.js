import Base from './Base.js';
import WOLFAPIError from './WOLFAPIError.js';

class IdHash extends Base {
  constructor (client, data, isSubscriber = true) {
    super(client);

    this.id = data?.id;
    this.hash = data?.hash;
    this.nickname = data?.nickname;
    this.isSubscriber = isSubscriber;
  }

  async subscriber () {
    if (!this.isSubscriber) {
      throw new WOLFAPIError('IdHash is channel');
    }

    return await this.client.subscriber.getById(this.id);
  }

  async channel () {
    if (this.isSubscriber) {
      throw new WOLFAPIError('IdHash is subscriber');
    }

    return await this.client.channel.getById(this.id);
  }

  toJSON () {
    return {
      id: this.id,
      hash: this.hash,
      nickname: this.nickname
    };
  }
}

export default IdHash;
