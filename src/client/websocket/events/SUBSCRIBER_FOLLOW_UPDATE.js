import BaseEvent from './BaseEvent.js';
import UserFollow from '../../../entities/UserFollow.js';

export default class SubscriberFollowUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow update');
  }

  async process (data) {
    const userFollower = this.client.me.followStore.following.list.get((item) => item.userId === data.id);

    if (userFollower === null) { return; }

    const oldUserFollower = userFollower.clone();

    userFollower.patch(data);

    return this.client.emit(
      'userFollowUpdated',
      oldUserFollower,
      userFollower
    );
  }
}
