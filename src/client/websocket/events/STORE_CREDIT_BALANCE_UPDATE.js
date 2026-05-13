import BaseEvent from './BaseEvent.js';

export default class StoreCreditBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store credit balance update');
  }

  async process (data) {
    const oldBalance = this.client.store._gold;
    this.client.store._gold = data.balance;

    return this.client.emit(
      'storeGoldBalanceUpdate',
      oldBalance,
      data.balance
    );
  }
}
