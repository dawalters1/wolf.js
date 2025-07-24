import BaseEvent from './baseEvent.js';

class SubscriberFollowUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow update');
  }

  async process (data) {
    const following = this.client.me._follow.following.list.get(data.id);

    if (!following) { return; }
    const oldFollowing = following.clone();

    return this.client.emit(
      'userFollowUpdate',
      oldFollowing,
      following.patch(
        {
          subscriberId: data.id,
          notification: data.additionalInfo.notification,
          hash: data.additionalInfo.hash
        }
      )
    );
  }
}

export default SubscriberFollowUpdateEvent;
