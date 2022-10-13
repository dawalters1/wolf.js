import Base from './Base.js';

class GroupStatsTrend extends Base {
  constructor (client, data) {
    super(client);
    this.day = data?.day;
    this.hour = data?.hour;
    this.lineCount = data?.lineCount;
  }

  toJSON () {
    return {
      day: this.day,
      hour: this.hour,
      lineCount: this.lineCount
    };
  }
}

export default GroupStatsTrend;
