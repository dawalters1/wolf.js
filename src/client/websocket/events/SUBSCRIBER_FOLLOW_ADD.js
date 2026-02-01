import BaseEvent from './BaseEvent.js';
import UserFollow from '../../../entities/UserFollow.js';

export default class SubscriberFollowAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'subscriber follow add');
  }

  async process (data) {
    const userFollow = new UserFollow(
      this.client,
      data
    );

    this.client.me.followStore.following.list.set(userFollow);

    return this.client.emit(
      'userFollowAdd',
      userFollow
    );
  }
}
