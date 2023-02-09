import Base from './Base.js';

class Validity extends Base {
  constructor (client, data) {
    super(client);
    this.fromTime = data.fromTime;
    this.endTime = data.endTime;
  }
}

export default Validity;
