import Base from './Base.js';

class ChannelAudioCounts extends Base {
  constructor (client, data) {
    super(client);
    this.broadcasterCount = data?.broadcasterCount;
    this.consumerCount = data?.consumerCount;
    this.id = data?.id;
  }
}

export default ChannelAudioCounts;
