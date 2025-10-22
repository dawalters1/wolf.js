import BaseEvent from './baseEvent.js';

class GroupRoleSubscriberUnassignEvent extends BaseEvent {
  constructor (client) {
    super(client, 'group role subscriber unassign');
  }

  async process (data) {
    const channel = this.client.channel.store.get(data.id);
    const user = this.client.user.store.get(data.additionalInfo.subscriberId);

    if (user) { user.roleStore.clear(); }

    if (channel === null) { return; }

    const role = channel.roleStore.users.get(data.additionalInfo.roleId);

    role?.userIdList?.delete(data.additionalInfo.subscriberId);

    const wasDeleted = channel.roleStore.users.delete((channelRoleUser) => channelRoleUser.userId === data.additionalInfo.subscriberId && channelRoleUser.roleId === data.additionalInfo.roleId);

    if (wasDeleted === false) { return; }

    this.client.emit(
      'channelRoleUserUnassign',
      data.additionalInfo.subscriberId,
      data.additionalInfo.roleId
    );
  }
}

export default GroupRoleSubscriberUnassignEvent;
