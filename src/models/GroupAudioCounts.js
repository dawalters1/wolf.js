import Base from './Base.js';

class GroupAudioCounts extends Base {
  constructor (client, data) {
    super(client);
    this.broadcasterCount = data?.broadcasterCount;
    this.consumerCount = data?.consumerCount;
    this.id = data?.id;
  }

  toJSON () {
    return {
      broadcasterCount: this.broadcasterCount,
      consumerCount: this.consumerCount,
      id: this.id
    };
  }
}

export default GroupAudioCounts;
