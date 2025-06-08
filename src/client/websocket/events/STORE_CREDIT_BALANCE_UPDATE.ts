import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerStoreCreditBalanceUpdate {
    balance: number;
}

class StoreCreditBalanceUpdateEvent extends BaseEvent<ServerStoreCreditBalanceUpdate> {
  constructor (client: WOLF) {
    super(client, 'store credit balance update');
  }

  async process (data: ServerStoreCreditBalanceUpdate) {
    throw new Error('NOT SUPPORTED');
    // this.client.store.balance = data.balance;
  }
}
export default StoreCreditBalanceUpdateEvent;
