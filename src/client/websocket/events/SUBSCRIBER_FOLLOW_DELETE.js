import BaseEvent from './BaseEvent.js';

export default class SubscriberFollowDeleteEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow delete');
  }

  async process (data) {
    const userFollower = this.client.me.followStore.following.list.get((item) => item.userId === data.id);

    this.client.me.followStore.following.list.delete((item) => item.userId === data.id);

    if (userFollower === null) { return; }

    return this.client.emit(
      'userFollowDelete',
      userFollower
    );
  }
}
