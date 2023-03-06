import { Event } from '../../../../../constants/index.js';

/**
 * @param {import('../../../../WOLF.js').default} client
 */
export default async (client, body) => {
  const contact = client.contact.blocked.blocked.find((blocked) => blocked.id === body.targetId);

  if (!contact) {
    return Promise.resolve();
  }

  client.contact.blocked.blocked = client.contact.blocked.blocked.filter((blocked) => blocked.id !== body.targetId);

  return await client.emit(
    Event.SUBSCRIBER_BLOCK_DELETE,
    contact
  );
};
