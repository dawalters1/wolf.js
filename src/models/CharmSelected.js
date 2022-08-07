import Base from './Base.js';
class CharmSelected extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.position = data?.position;
  }
}
export default CharmSelected;
