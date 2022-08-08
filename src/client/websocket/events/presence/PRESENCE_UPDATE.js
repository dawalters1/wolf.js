import { Event } from '../../../../constants/index.js';
import { Presence } from '../../../../models/index.js';
import patch from '../../../../utils/patch.js';

export default async (client, body) => {
  const subscriber = client.subscriber.cache.find((subscriber) => subscriber.id === body.id);
  const old = new Presence(client, { subscriberId: body.id });

  if (subscriber) {
    patch(old, subscriber); // Set whatever the cached profile shows
    subscriber.onlineState = body.onlineState;
    subscriber.deviceType = body.deviceType;
  }

  const existing = client.subscriber.presence.find((presence) => presence.subscriberId === body.subscriberId);

  if (existing) {
    patch(old, existing); // Subscription to presence will most likely be more up to date, set this instead
    Reflect.deleteProperty(body, 'id');
    patch(existing, body);
  }

  if (!subscriber && !existing) {
    return;
  }

  return client.emit(Event.PRESENCE_UPDATE, old, client.subscriber.presence.find((presence) => presence.subscriberId === body.subscriberId));
};
