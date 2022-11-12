import Base from './Base.js';

class Validity extends Base {
  constructor (client, data) {
    super(client);
    this.fromTime = data.fromTime;
    this.endTime = data.endTime;
  }

  toJSON () {
    return {
      fromTime: this.fromTime,
      endTime: this.endTime
    };
  }
}

export default Validity;
