import BaseEvent from './BaseEvent.js';

export default class SubscriberUpdate extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber update');
  }

  async process (data) {
    const oldUser = this.client.user.store.get((item) => item.id === data.id)?.clone() ?? null;

    if (oldUser?.hash === data.hash) { return; }

    const newUser = await this.client.user.fetch(data.id, { forceNew: true });

    if (newUser === null) {
      return this.client.emit(
        'userDeleted',
        oldUser
      );
    }

    // Update contacts
    [
      this.client.contact.store.get((item) => item.id === oldUser.id) ?? null,
      this.client.contact.blocked.store.get((item) => item.id === oldUser.id) ?? null
    ]
      .forEach((contact) =>
        contact?.patch(newUser)
      );

    // Update channel owners and members
    this.client.channel.store.values().forEach((channel) => {
      if (channel.owner.id === oldUser.id) {
        channel.owner.patch(newUser);
      }

      // TODO: update event host IDs (how does this migrate ids?)

      channel.memberStore.get((item) => item.id === oldUser.id)?.patch(newUser);
    });

    return this.client.emit(
      'userProfileUpdate',
      oldUser,
      newUser
    );
  }
}
