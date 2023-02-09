import Base from './Base.js';

class WolfstarsProfile extends Base {
  constructor (client, data) {
    super(client);
    this.maxListeners = data?.maxListeners ?? 0;
    this.shows = data?.shows ?? 0;
    this.subscriberId = data?.subscriberId;
    this.talentList = data?.talentList || [];
    this.totalListeners = data?.totalListeners ?? 0;

    this.exists = Object.values(data)?.length > 1;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.subscriberId);
  }
}

export default WolfstarsProfile;
