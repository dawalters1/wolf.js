import { Event, ServerEvent } from '../../../../constants/index.js';
import Base from '../Base.js';

/**
 * @param {import('../../../WOLF.js').default} this.client
 */
class StoreCreditBalanceUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.STORE_CREDIT_BALANCE_UPDATE);
  }

  async process (body) {
    const oldBalance = this.client.store._balance;

    this.client.store._balance = body.balance;

    return this.client.emit(
      Event.STORE_CREDIT_BALANCE_UPDATE,
      oldBalance >= 0 ? oldBalance : 0,
      body.balance
    );
  };
}
export default StoreCreditBalanceUpdate;
