import { WOLFAPIError } from '../../../models/index.js';

class Base {
   /**
   * 
   * @param {import('../../WOLF.js').default} client 
   */
  constructor (client, event) {
    this.client = client;
    this.event = event;
  }

  async process () {
    throw new WOLFAPIError('Event handler not implemented', { event: this.event });
  }
}

export default Base;
