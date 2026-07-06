import BaseEvent from './BaseEvent.js';

export default class StoreCreditBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store credit balance update');
  }

  async process (data) {
    const oldBalance = this.client.store._gold;
    this.client.store._gold = data.balance;

    this.client.log.debug(`[StoreCreditBalanceUpdate]: Gold balance updated [oldBalance:${JSON.stringify(oldBalance)}][newBalance:${JSON.stringify(data.balance)}]`);

    return this.client.emit(
      'storeGoldBalanceUpdate',
      oldBalance,
      data.balance
    );
  }
}
