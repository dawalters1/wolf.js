import BaseHelper from '../BaseHelper.js';
import GiftTierRange from '../../entities/GiftTierRange.js';

export default class GiftTierHelper extends BaseHelper {
  async fetch (opts) {
    if (!opts.forceNew && this.store.fetched) {
      return this.store.values();
    }

    const response = await this.client.websocket.emit(
      'gift tier range list'
    );

    return response.body.map((serverGiftTier) => this.store.set(new GiftTierRange(this.client, serverGiftTier), response.headers?.maxAge));
  }
}
