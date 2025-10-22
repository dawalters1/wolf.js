import BaseEvent from './baseEvent.js';

class SubscriberUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber update');
  }

  async process (data) {
    const oldUser = this.client.user.store.get(data.id)?.clone() ?? null;

    if (oldUser === null || oldUser.hash === data.hash) { return; }

    const newUser = await this.client.user.getById(data.id, { forceNew: true });

    if (newUser === null) { return; }

    const contactables = [
      this.client.contact.store.get(data.id) ?? null,
      this.client.contact.blocked.store.get(data.id) ?? null
    ];

    contactables.forEach((contact) => contact?.patch(newUser));

    this.client.channel.store.values().forEach((channel) => {
      if (channel.owner.id === oldUser.id) {
        channel.owner.patch(newUser);
      }

      channel._members.get(oldUser.id)?.patch(newUser);
    });

    this.client.emit(
      'userProfileUpdate',
      oldUser,
      newUser
    );
  }
}

export default SubscriberUpdateEvent;
