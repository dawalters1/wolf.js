import BaseEvent from './BaseEvent.js';
import ChannelRoleUser from '../../../entities/channelRoleUser.js';

export default class GroupRoleSubscriberAssignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber assign');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }
  }
}
