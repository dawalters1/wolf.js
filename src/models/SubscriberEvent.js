import Base from './Base.js';
import SubscriberEventAdditionalInfo from './SubscriberEventAdditionalInfo.js';

class SubscriberEvent extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.channelId = data?.channelId;
    this.groupId = this.channelId;
    this.additionalInfo = new SubscriberEventAdditionalInfo(client, data?.additionalInfo);
  }

  /**
   * Get an event profile
   * @returns {Promise<Event>}
   */
  async get () {
    return await this.client.event.getById(this.id);
  }

  /**
   * Add an event to the bots subscription list
   * @returns {Promise<Response>}
   */
  async subscribe () {
    return await this.client.event.subscription.add(this.id);
  }

  /**
   * Remove an event from the bots subscription list
   * @returns {Promise<Response<undefined>>}
   */
  async unsubscribe () {
    return await this.client.event.subscription.remove(this.id);
  }
}

export default SubscriberEvent;
