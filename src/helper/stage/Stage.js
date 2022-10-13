import Base from '../Base.js';
import Request from './Request.js';
import Slot from './Slot.js';

class Stage extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);
    this.request = new Request(this.client);
    this.slot = new Slot(this.client);
  }
}

export default Stage;
