import BaseEvent from './baseEvent.js';
import UserFollow from '../../../entities/userFollow.js';

class SubscriberFollowAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow add');
  }

  async process (data) {
    if (!this.client.me.followStore.following.list.fetched) { return; }

    return this.client.emit(
      'userFollowAdd',
      this.client.me.followStore.following.list.set(
        new UserFollow(
          this.client,
          {
            subscriberId: data.id,
            hash: data.additionalInfo.hash,
            notification: true
          }
        )
      )
    );
  }
}

export default SubscriberFollowAddEvent;
