import Base from './Base.js';

class WolfstarsProfile extends Base {
  constructor (client, data) {
    super(client);
    this.maxListeners = data?.maxListeners;
    this.shows = data?.shows;
    this.subscriberId = data?.subscriberId;
    this.talentList = data?.talentList;
    this.totalListeners = data?.totalListeners;

    this.exists = Object.values(data)?.length > 1;
  }

  toJSON () {
    return {
      maxListeners: this.maxListeners,
      shows: this.shows,
      subscriberId: this.subscriberId,
      talentList: this.talentList,
      totalListeners: this.totalListeners,
      exists: this.exists
    };
  }
}

export default WolfstarsProfile;
