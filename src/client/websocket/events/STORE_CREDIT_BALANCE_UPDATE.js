import BaseEvent from './Base.js';

class StoreCreditBalanceUpdate extends BaseEvent {
  constructor () {
    super('store credit balance update');
  }
}

export default StoreCreditBalanceUpdate;
