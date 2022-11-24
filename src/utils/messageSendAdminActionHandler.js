/* eslint-disable no-fallthrough */
import { Capability, Event } from '../constants/index.js';
import GroupMemberList from '../models/GroupMemberList.js';
import GroupSubscriberUpdate from '../models/GroupSubscriberUpdate.js';

const toCapability = (subscriber, group, type) => {
  switch (type) {
    case 'join':
      return group.owner.id === subscriber.id ? Capability.OWNER : Capability.REGULAR;
    case 'leave':
    case 'kick':
      return Capability.NOT_MEMBER;
    case 'banned':
    case 'ban':
      return Capability.BANNED;
    case 'admin':
      return Capability.ADMIN;
    case 'silence':
      return Capability.SILENCED;
    case 'mod':
      return Capability.MOD;
    case 'reset':
      return Capability.REGULAR;
    case 'owner':
      return Capability.OWNER;
  }
};

export default async (client, message) => {
  const [subscriber, group] = await Promise.all(
    [
      client.subscriber.getById(message.sourceSubscriberId),
      client.group.getById(message.targetGroupId)
    ]
  );

  const action = JSON.parse(message.body);
  const capabilities = toCapability(subscriber, group, action.type);

  switch (action.type) {
    case 'join':
    {
      await group.members._onJoin(subscriber, capabilities);

      group.membersCount++;

      return client.emit(
        subscriber.id === client.currentSubscriber.id ? Event.JOINED_GROUP : Event.GROUP_MEMBER_ADD,
        group,
        subscriber
      );
    }
    case 'leave':
    case 'kick': // eslint-disable-line padding-line-between-statements
    {
      if (action.type === 'leave' && action.instigatorId) {
        action.type = 'kick';
      }

      if (subscriber.id === client.currentSubscriber.id) {
        group.capabilities = capabilities;
        group.inGroup = false;
        group.members = new GroupMemberList(client, group.id);
      }

      await group.members._onLeave(subscriber, capabilities);
      group.membersCount--;

      return client.emit(
        subscriber.id === client.currentSubscriber.id ? Event.LEFT_GROUP : Event.GROUP_MEMBER_DELETE,
        group,
        subscriber
      );
    }

    case 'owner': // eslint-disable-line padding-line-between-statements
    case 'admin': // eslint-disable-line padding-line-between-statements
    case 'mod': // eslint-disable-line padding-line-between-statements
    case 'reset': // eslint-disable-line padding-line-between-statements
    case 'silence':// eslint-disable-line padding-line-between-statements
    case 'ban':// eslint-disable-line padding-line-between-statements
    {
      await group.members._onUpdate(subscriber, capabilities);

      // non-mod+ users do not have access to banned lists
      if (action.type === 'reset' && subscriber.id === client.currentSubscriber.id) {
        group.members._misc.members.push(...group.members._banned.members);

        await group.members._banned.reset();
      }

      return client.emit(
        Event.GROUP_MEMBER_UPDATE,
        group,
        new GroupSubscriberUpdate(this.client,
          {
            groupId: group.id,
            sourceId: action.instigatorId,
            targetId: message.sourceSubscriberId,
            action: action.type
          }
        )
      );
    }
  }
};
