import { Event, ServerEvent } from '../../../../../constants/index.js';
import models, { IdHash } from '../../../../../models/index.js';
import patch from '../../../../../utils/patch.js';
import Base from '../../Base.js';


class SubscriberUpdate extends Base {
  /**
   * 
   * @param {import('../../../../WOLF.js').default} client 
   */
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

    for(const channel of this.client.channel.channels) {
      if(channel.owner.id === oldSubscriber.id){
        channel.owner = new IdHash(this.client, newSubscriber, true);
      }

      const member = channel.members._members.get(oldSubscriber.id);
     
      if(member){
        member.hash = newSubscriber.hash;
      }
    }

    return this.client.emit(
      Event.SUBSCRIBER_UPDATE,
      oldSubscriber,
      newSubscriber
    );
  };
}
export default SubscriberUpdate;
