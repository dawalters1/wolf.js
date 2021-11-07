
const BaseEvent = require('../BaseEvent');
const internal = require('../../../constants/internal');
const event = require('../../../constants/event');

const { messageType, capability, privilege } = require('@dawalters1/constants');
const toAdminActionFromString = require('../../../internalUtils/toAdminActionFromString');
const toGroupMemberCapability = require('../../../internalUtils/toGroupMemberCapability');
const { version } = require('../../../../package.json');
const toBaseMessage = require('../../../internalUtils/toBaseMessage');

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

    return api.on._emit(message.sourceSubscriberId === api.currentSubscriber.id ? internal.JOINED_GROUP : event.GROUP_MEMBER_ADD, group, subscriber);
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
    return api.on._emit(subscriber.id === api.currentSubscriber.id ? internal.LEFT_GROUP : event.GROUP_MEMBER_DELETE, group, subscriber);
  }

  return api.on._emit(event.GROUP_MEMBER_UPDATE, group,
    {
      groupId: group.id,
      sourceId: adminAction.instigatorId,
      targetId: message.sourceSubscriberId,
      action: adminAction.type
    }
  );
};

/**
 * {@hideconstructor}
 */
module.exports = class MessageSend extends BaseEvent {
  async process (data) {
    const message = toBaseMessage(this._api, data);

    switch (message.type) {
      case messageType.APPLICATION_PALRINGO_GROUP_ACTION:
        await handleAdminAction(this._api, message);
        break;
      case messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE:
        this._api.on._emit(internal.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await this._api.subscriber().getById(message.sourceSubscriberId));
        break;

      case messageType.TEXT_PLAIN:
        {
          if (message.sourceSubscriberId === this._api.currentSubscriber.id) {
            return Promise.resolve();
          }

          const secret = this._api._botConfig.secrets.find((secret) => this._api.utility().string().isEqual(secret.command, message.body) || this._api.utility().string().isEqual(secret.commandShort, message.body));

          if (secret && (this._api.options.developerId === message.sourceSubscriberId || await this._api.utility().subscriber().privilege().has(message.sourceSubscriberId, [privilege.STAFF, privilege.VOLUNTEER]))) {
            return await this._api.messaging().sendMessage(
              message,
              this._api.utility().string().replace(secret.responses[Math.floor(Math.random() * secret.responses.length)],
                {
                  version
                }
              )
            );
          }

          const messageSubscriptions = this._api.messaging()._messageSubscriptions.filter((subscription) => subscription.predicate(message));

          if (messageSubscriptions.length > 0) {
            for (const messageSubscription of messageSubscriptions) {
              if (messageSubscription.timeoutInterval) {
                clearTimeout(messageSubscription.timeoutInterval);
              }

              this._api.messaging()._messageSubscriptions = this._api.messaging()._messageSubscriptions.filter((subscription) => subscription.subscriptionId !== messageSubscription.subscriptionId);
              this._api.messaging()._deferreds[messageSubscription.subscriptionId].resolve(message);
            }
          }
        }
        break;
    }

    return this._api.on._emit(message.isGroup ? internal.GROUP_MESSAGE : internal.PRIVATE_MESSAGE, message);
  }
};
