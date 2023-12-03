import { patch } from '../../../../utils/index.js';
import { Event, ServerEvent } from '../../../../constants/index.js';
import models from '../../../../models/index.js';
import Base from '../Base.js';

/**
 * @param {import('../../../WOLF.js').default} this.client
 */
class PresenceUpdate extends Base {
  constructor (client) {
    super(client, ServerEvent.PRESENCE_UPDATE);
  }

  async process (body) {
    const subscriber = this.client.subscriber.subscribers.find((subscriber) => subscriber.id === body.id);
    const old = new models.Presence(this.client, { subscriberId: body.id });

    if (subscriber) {
      patch(old, subscriber); // Set whatever the cached profile shows
      subscriber.onlineState = body.onlineState;
      subscriber.deviceType = body.deviceType;
    }

    const existing = this.client.subscriber.presence.presences.find((presence) => presence.subscriberId === body.subscriberId);

    if (existing) {
      patch(old, existing); // Subscription to presence will most likely be more up to date, set this instead
      Reflect.deleteProperty(body, 'id');
      patch(existing, body);
    }

    if (!subscriber && !existing) {
      return;
    }

    return this.client.emit(
      Event.PRESENCE_UPDATE,
      old,
      this.client.subscriber.presence.presences.find((presence) => presence.subscriberId === body.subscriberId)
    );
  };
}
export default PresenceUpdate;
