import Base from './Base.js';

class GroupStatsTop extends Base {
  constructor (client, data) {
    super(client);
    this.nickname = data?.nickname;
    this.randomQoute = data?.randomQoute;
    this.subId = data?.subId;
    this.value = data?.value;
    this.percentage = data?.percentage;
  }

  toJSON () {
    return {
      nickname: this.nickname,
      randomQoute: this.randomQoute,
      subId: this.subId,
      value: this.value,
      percentage: this.percentage
    };
  }
}

export default GroupStatsTop;