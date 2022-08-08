import { Event, Capability } from '../constants/index.js';

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

    case 'silenced':
      return Capability.SILENCED;

    case 'banned':
      return Capability.BANNED;

    default:
      return Capability.NOT_MEMBER;
  }
};

export default async (api, message) => {
  const [group, subscriber] = await Promise.all([
    api.group.getById(message.targetGroupId),
    api.subscriber.getById(message.sourceSubscriberId)
  ]);
  const action = JSON.parse(message.body);

  if (action.type === 'join') {
    group._members.push({
      capabilities: group.owner.id === subscriber.id ? Capability.OWNER : Capability.REGULAR,
      groupId: group.id,
      subscriberId: subscriber.id
    });

    return api.emit(
      subscriber.id === api.currentSubscriber.id ? Event.JOINED_GROUP : Event.GROUP_MEMBER_ADD,
      group,
      subscriber
    );
  }

  let existing = group._members.find(
    (subscriber) => subscriber.subscriberId === subscriber.id
  );

  if (!existing) {
    existing = { groupId: group.id, subscriberId: subscriber.id };

    group._members.push(existing);
  }

  if (action.type === 'leave' && action.investigatorId) {
    action.type = 'kick';
  }

  if (action.type === 'leave' || action.type === 'kick') {
    existing.capabilities = Capability.NOT_MEMBER;

    return api.emit(
      subscriber.id === api.currentSubscriber.id ? Event.LEFT_GROUP : Event.GROUP_MEMBER_DELETE,
      group,
      subscriber
    );
  }

  existing.capabilities = toCapability(action.type);

  return api.emit(Event.GROUP_MEMBER_UPDATE, group, subscriber, {
    sourceId: action.instigatorId,
    action: action.type,
    capabilities: toCapability(action.type)
  });
};
