import { Event, Capability, Privilege } from '../constants/index.js';
import { GroupMember } from '../models/GroupMember.js';

const toCapability = (adminAction) => {
  switch (adminAction) {
    case 'owner':
      return Capability.OWNER;

    case 'admin':
      return Capability.ADMIN;

    case 'mod':
      return Capability.MOD;

    case 'reset':
      return Capability.REGULAR;

    case 'silence':
      return Capability.SILENCED;

    case 'banned':
      return Capability.BANNED;

    case 'join':
      return Capability.REGULAR;

    default:
      return Capability.NOT_MEMBER;
  }
};

const toMemberListType = (action) => {
  switch (action) {
    case Capability.OWNER:
    case Capability.ADMIN:
    case Capability.MOD:
      return 'privileged';
    case Capability.REGULAR:
      return 'regular';
    case Capability.SILENCED:
      return 'silenced';
    case Capability.BANNED:
      return 'banned';
  }
};

export default async (client, message) => {
  const [group, subscriber] = await Promise.all([
    client.group.getById(message.targetGroupId),
    client.subscriber.getById(message.sourceSubscriberId)
  ]);

  const action = JSON.parse(message.body);

  // Remove user from lists, so can be added to correct list
  group.members._remove(message.sourceSubscriberId, ['leave', 'kick'].includes(action.type));

  switch (action.type) {
    case 'owner':
    case 'admin':
    case 'mod':
    case 'banned':
    case 'silence':

    // eslint-disable-next-line no-fallthrough
    case 'reset':
      {
        const member = new GroupMember(
          client,
          {
            id: message.sourceSubscriberId,
            capabilities: action.type === 'join' ? group.owner.id === message.sourceSubscriberId ? Capability.OWNER : Capability.REGULAR : toCapability(action.type),
            hash: subscriber.hash
          }
        );

        group.members[toMemberListType(toCapability(action.type))].complete ? group.members[toMemberListType(toCapability(action.type))]._add(member) : group.members.misc.push(new GroupMember(member));

        client.emit(
          Event.GROUP_MEMBER_UPDATE,
          group,
          {
            groupId: group.id,
            sourceId: action.instigatorId,
            targetId: message.sourceSubscriberId,
            action: action.type
          }
        );
      }
      break;

    case 'join':
      {
        const member = new GroupMember(
          client,
          {
            id: message.sourceSubscriberId,
            capabilities: action.type === 'join' ? group.owner.id === message.sourceSubscriberId ? Capability.OWNER : Capability.REGULAR : toCapability(action.type),
            hash: subscriber.hash
          }
        );

        group.owner.id === message.sourceSubscriberId && group.members.privileged.complete ? group.members.privileged._add(member) : group.members.misc.push(new GroupMember(member));

        if (client.utility.subscriber.privilege.has(message.sourceSubscriberId, Privilege.BOT) && group.members.bots.complete) {
          group.members.bots._add(member);
        }

        client.emit(
          message.sourceSubscriberId === client.currentSubscriber.id ? Event.JOINED_GROUP : Event.GROUP_MEMBER_ADD,
          group,
          subscriber
        );
      }
      break;
    case 'kick':
    case 'leave':
      if (action.type === 'leave' && action.instigatorId) {
        action.type = 'kick';
      }

      return client.emit(
        message.sourceSubscriberId === client.currentSubscriber.id ? Event.LEFT_GROUP : Event.GROUP_MEMBER_DELETE,
        group,
        subscriber
      );
    default:
      return console.error('Unsupported group action', action.type);
  }
};
