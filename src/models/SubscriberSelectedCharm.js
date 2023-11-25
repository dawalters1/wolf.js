import Base from './Base.js';
import CharmSelected from './CharmSelected.js';
import WOLFAPIError from './WOLFAPIError.js';

class SubscriberSelectedCharm extends Base {
  constructor (client, data, subscriberId) {
    super(client);
    this.subscriberId = subscriberId;

    this.selectedList = (data?.selectedList ?? []).map((selected) => new CharmSelected(client, selected));
  }

  async set (charms) {
    if (this.subscriberId !== this.client.currentSubscriber.id) {
      throw new WOLFAPIError('can only set charms for currentSubscriber', { subscriberId: this.client.currentSubscriber.id });
    }

    return await this.client.charm.set(charms);
  }

  async clear () {
    if (this.subscriberId !== this.client.currentSubscriber.id) {
      throw new WOLFAPIError('can only set charms for currentSubscriber', { subscriberId: this.client.currentSubscriber.id });
    }

    return await this.client.charm.set([]);
  }
}

export default SubscriberSelectedCharm;
