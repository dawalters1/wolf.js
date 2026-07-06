import BaseEvent from './BaseEvent.js';

export default class StoreJawaherBalanceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'store jawaher balance update');
  }

  async process (data) {
    const oldBalance = this.client.store._jawaher;
    this.client.store._jawaher = data.balance;

    this.client.log.debug(`[StoreGemBalanceUpdate]: Gem balance updated [oldBalance:${JSON.stringify(oldBalance)}][newBalance:${JSON.stringify(data.balance)}]`);

    return this.client.emit(
      'storeJawaherBalanceUpdate',
      oldBalance,
      data.balance
    );
  }
}
