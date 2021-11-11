const { messageType, capability, privilege } = require('@dawalters1/constants');
const Message = require('../../../../models/MessageObject');

const toAdminActionFromString = require('../../../../utils/ToAdminActionFromString');
const toGroupMemberCapability = require('../../../../utils/ToGroupMemberCapability');
const { version } = require('../../../../../package.json');
const { events } = require('../../../../constants');

const handleAdminAction = async (api, message) => {
  const [group, subscriber] = await Promise.all([
    api.group().getById(message.targetGroupId),
    api.subscriber().getById(message.sourceSubscriberId)
  ]);

  const adminAction = JSON.parse(message.body);

  // Handle Join Action
  if (adminAction.type === 'join') {
    if (group.subscribers) {
      group.subscribers.push(
        {
          id: subscriber.id,
          groupId: group.id,
          capabilities: group.owner.id === subscriber.id ? capability.OWNER : capability.REGULAR,
          additionalInfo: {
            hash: subscriber.hash,
            nickname: subscriber.nickname,
            privileges: subscriber.privileges,
            onlineState: subscriber.onlineState
          }
        }
      );
    }

    if (subscriber.id === api.currentSubscriber.id) {
      group.capability = group.owner.id === subscriber.id ? capability.OWNER : capability.REGULAR;
      group.inGroup = true;
    }

    return api.emit(
      message.sourceSubscriberId === api.currentSubscriber.id ? events.JOINED_GROUP : events.GROUP_MEMBER_ADD,
      {
        group,
        subscriber
      }
    );
  }

  // Handle all other actions
  if (adminAction.type === 'leave' && adminAction.instigatorId) {
    adminAction.type = 'kick';
  }

  if (subscriber.id === api.currentSubscriber.id) {
    group.capabilities = toGroupMemberCapability(toAdminActionFromString(adminAction.type));

    if (group.capabilities === capability.NOT_MEMBER || group.capabilities === capability.BANNED) {
      group.inGroup = false;
      group.subscribers = [];

      await api.messaging()._messageGroupUnsubscribe(group.id);
    } else if (group.capabilities === capability.OWNER) {
      group.owner.id = subscriber.id;
      group.owner.hash = subscriber.hash;
    }
  } else if (group.subscribers) {
    const groupMember = group.subscribers.find((grpMber) => grpMber.id === subscriber.id);

    if (groupMember) {
      if (adminAction.type === 'owner') {
        group.owner.id = subscriber.id;
        group.owner.hash = subscriber.hash;
        groupMember.capabilities = capability.OWNER;
      } else {
        if (adminAction.type === 'kick' || adminAction.type === 'leave') {
          group.subscribers.splice(group.subscribers.indexOf(groupMember), 1);
        } else {
          groupMember.capabilities = toGroupMemberCapability(toAdminActionFromString(adminAction.type));
        }
      }
    }
  }

  if (adminAction.type === 'leave' || adminAction.type === 'kick') {
    return api.emit(
      subscriber.id === api.currentSubscriber.id ? events.LEFT_GROUP : events.GROUP_MEMBER_DELETE,
      {
        group,
        subscriber
      }
    );
  }

  return api.emit(
    events.GROUP_MEMBER_UPDATE,
    {
      group,
      action: {
        groupId: group.id,
        sourceId: adminAction.instigatorId,
        targetId: message.sourceSubscriberId,
        action: adminAction.type
      }
    }
  );
};

module.exports = async (api, body) => {
  const message = new Message(api, body);

  switch (message.type) {
    case messageType.APPLICATION_PALRINGO_GROUP_ACTION:
      await handleAdminAction(api, message);
      break;
    case messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE:
      api.emit(events.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await api.subscriber().getById(message.sourceSubscriberId));
      break;

    case messageType.TEXT_PLAIN:
    {
      if (message.sourceSubscriberId === api.currentSubscriber.id) {
        return Promise.resolve();
      }

      const secret = api._botConfig.secrets.find((secret) => api.utility().string().isEqual(secret.command, message.body) || api.utility().string().isEqual(secret.commandShort, message.body));

      if (secret && (api.options.developerId === message.sourceSubscriberId || await api.utility().subscriber().privilege().has(message.sourceSubscriberId, [privilege.STAFF, privilege.VOLUNTEER]))) {
        return await api.messaging().sendMessage(
          message,
          api.utility().string().replace(secret.responses[Math.floor(Math.random() * secret.responses.length)],
            {
              version
            }
          )
        );
      }
    }
  }

  const messageSubscriptions = api.messaging()._subscriptionData.subscriptions.filter((subscription) => subscription.predicate(message));

  if (messageSubscriptions.length > 0) {
    for (const messageSubscription of messageSubscriptions) {
      if (messageSubscription.timeoutInterval) {
        clearTimeout(messageSubscription.timeoutInterval);
      }

      api.messaging()._subscriptionData.subscriptions = api.messaging()._subscriptionData.subscriptions.filter((subscription) => subscription.subscriptionId !== messageSubscription.subscriptionId);
      api.messaging()._subscriptionData.defs[messageSubscription.subscriptionId].resolve(message);
    }
  }

  return await api.emit(
    message.isGroup ? events.GROUP_MESSAGE : events.PRIVATE_MESSAGE,
    message
  );
};
