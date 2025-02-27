import Base from './Base.js';

class WOLFStarTalent extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.name = data?.name;
  }
}

export default WOLFStarTalent;
