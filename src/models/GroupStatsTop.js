import Base from './Base.js';

class GroupStatsTop extends Base {
  constructor (client, data) {
    super(client);
    this.nickname = data?.nickname;
    this.randomQuote = data?.randomQuote;
    this.subId = data?.subId;
    this.wpl = data?.wpl;
    this.value = data?.value;
    this.percentage = data?.percentage;
  }

  async subscriber () {
    return await this.client.subscriber.getById(this.subId);
  }
}

export default GroupStatsTop;
