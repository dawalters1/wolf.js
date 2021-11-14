const Message = require('../../../../models/MessageObject');

const { version } = require('../../../../../package.json');
const { Events, MessageType, Privilege } = require('../../../../constants');

const handleAdminAction = async (api, message) => {
  const [group, subscriber] = await Promise.all([
    api.group().getById(message.targetGroupId),
    api.subscriber().getById(message.sourceSubscriberId)
  ]);

  const adminAction = JSON.parse(message.body);

  if (adminAction.type === 'join') {
    return Promise.resolve();
  }

  // Handle all other actions
  if (adminAction.type === 'leave' && adminAction.instigatorId) {
    adminAction.type = 'kick';
  }

  if (adminAction.type === 'leave' || adminAction.type === 'kick') {
    if (subscriber.id !== api.currentSubscriber.id) {
      api.emit(
        subscriber.id === api.currentSubscriber.id ? Events.LEFT_GROUP : Events.GROUP_MEMBER_DELETE,
        group,
        subscriber
      );
    }
  }

  if (adminAction.type === 'leave') {
    return Promise.resolve();
  }

  return api.emit(
    Events.GROUP_MEMBER_UPDATE,
    group,
    {
      groupId: group.id,
      sourceId: adminAction.instigatorId,
      targetId: message.sourceSubscriberId,
      action: adminAction.type
    }
  );
};

module.exports = async (api, body) => {
  const message = new Message(api, body);

  switch (message.type) {
    case MessageType.APPLICATION_PALRINGO_GROUP_ACTION:
      await handleAdminAction(api, message);
      break;
    case MessageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE:
      api.emit(Events.PRIVATE_MESSAGE_ACCEPT_RESPONSE, await api.subscriber().getById(message.sourceSubscriberId));
      break;

    case MessageType.TEXT_PLAIN:
    {
      if (message.sourceSubscriberId === api.currentSubscriber.id) {
        return Promise.resolve();
      }

      const secret = api._botConfig.secrets.find((secret) => api.utility().string().isEqual(secret.command, message.body) || api.utility().string().isEqual(secret.commandShort, message.body));

      if (secret && (api.options.developerId === message.sourceSubscriberId || await api.utility().subscriber().privilege().has(message.sourceSubscriberId, [Privilege.STAFF, Privilege.VOLUNTEER]))) {
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
    message.isGroup ? Events.GROUP_MESSAGE : Events.PRIVATE_MESSAGE,
    message
  );
};
