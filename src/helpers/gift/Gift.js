import BaseHelper from '../BaseHelper.js';
import GiftTierHelper from './GiftTier.js';

export default class GiftHelper extends BaseHelper {
  #tier;
  constructor (client) {
    super(client);

    this.#tier = new GiftTierHelper(client);
  }

  get tier () {
    return this.#tier;
  }

  // TODO: group gift summary
  // TODO: group gift
}
