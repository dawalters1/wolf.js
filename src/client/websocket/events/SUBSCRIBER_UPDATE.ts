import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';

interface ServerSubscriberUpdate {
    id: number;
    hash: string
}

class SubscriberUpdateEvent extends BaseEvent<ServerSubscriberUpdate> {
  constructor (client: WOLF) {
    super(client, 'subscriber update');
  }

  async process (data: ServerSubscriberUpdate) {
    const oldUser = this.client.user.cache.get(data.id)?.clone() ?? null;

    if (oldUser === null || oldUser.hash === data.hash) { return; }

    const newUser = await this.client.user.getById(data.id, { forceNew: true });

    if (newUser === null) { return; }

    const contactables = [
      this.client.contact.cache.get(data.id) ?? null,
      this.client.contact.blocked.cache.get(data.id) ?? null
    ];

    contactables.forEach((contact) => contact?.patch(newUser));

    this.client.channel.cache.values().forEach((channel) => {
      if (channel.owner.id === oldUser.id) {
        channel.owner.patch(newUser);
      }

      channel.members.get(oldUser.id)?.patch(newUser);
    });

    this.client.emit(
      'userProfileUpdate',
      oldUser,
      newUser
    );
  }
}

export default SubscriberUpdateEvent;
