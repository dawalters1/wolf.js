import BaseEvent from './BaseEvent.js';

export default class StoreCreditBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store credit balance update');
  }

  async process (data) {
    const oldBalance = this.client.store._balance;
    this.client.store._balance = data.balance;

    return this.client.emit(
      'storeCreditBalanceUpdate',
      oldBalance,
      data.balance
    );
  }
}
