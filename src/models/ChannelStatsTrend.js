import Base from './Base.js';

class ChannelStatsTrend extends Base {
  constructor (client, data) {
    super(client);
    this.day = data?.day;
    this.hour = data?.hour;
    this.lineCount = data?.lineCount;
  }
}

export default ChannelStatsTrend;
