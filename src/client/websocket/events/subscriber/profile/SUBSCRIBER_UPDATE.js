import { Event, ServerEvent } from '../../../../../constants/index.js';
import models from '../../../../../models/index.js';
import patch from '../../../../../utils/patch.js';
import Base from '../../Base.js';

/**
 *
 * @param {import('../../../../WOLF').default} this.client
 * @param {*} body
 * @returns
 */
class SubscriberUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.SUBSCRIBER_UPDATE);
  }

  async process (body) {
    const cached = this.client.subscriber.subscribers.find((subscriber) => subscriber.id === body.id);

    if (!cached || cached.hash === body.hash) { return false; }

    const oldSubscriber = new models.Subscriber(this.client, cached);
    const newSubscriber = await this.client.subscriber.getById(body.id, true, true);

    [
      this.client.contact.contacts.find((contact) => contact.id === newSubscriber.id),
      this.client.contact.blocked.blocked.find((contact) => contact.id === newSubscriber.id)
    ]
      .filter((Boolean))
      .map((contact) =>
        patch(contact, newSubscriber.toContact())
      );

    await Promise.all(
      (await this.client.channel.list())
        .map((channel) =>
          channel.members?._onSubscriberUpdate(newSubscriber)
        )
    );

    return this.client.emit(
      Event.SUBSCRIBER_UPDATE,
      oldSubscriber,
      newSubscriber
    );
  };
}
export default SubscriberUpdate;
