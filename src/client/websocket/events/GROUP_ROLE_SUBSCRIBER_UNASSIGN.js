import BaseEvent from './BaseEvent.js';
import ChannelRoleUser from '../../../entities/channelRoleUser.js';

export default class GroupRoleSubscriberUnassignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber unassign');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.id);

    if (channel === null) { return; }
  }
}
