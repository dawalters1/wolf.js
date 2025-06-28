import BaseEvent from './baseEvent.js';

class StoreCreditBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store credit balance update');
  }

  async process (data) {
    throw new Error('NOT SUPPORTED');
    // this.client.store.balance = data.balance;
  }
}
export default StoreCreditBalanceUpdateEvent;
