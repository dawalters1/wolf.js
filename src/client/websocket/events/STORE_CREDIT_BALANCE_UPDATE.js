import BaseEvent from './baseEvent.js';

class StoreCreditBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store credit balance update');
  }

  async process (data) {
    if (this.client.store._balance === -1) { return; }

    const wasBalance = this.client.store._balance;
    this.client.store._balance = data.balance;

    this.client.emit(
      'storeCreditBalanceUpdate',
      wasBalance,
      data.balance
    );
  }
}
export default StoreCreditBalanceUpdateEvent;
