const Message = require('../../../../models/MessageObject');
const { version } = require('../../../../../package.json');

const { Events, MessageType, Privilege, Capability, MessageLinkingType } = require('../../../../constants');

// Stop gap join/leave handling incase group members list isnt requested
const handleAdminAction = async (api, message) => {
  const [group, subscriber] = await Promise.all([
    api.group().getById(message.targetGroupId),
    api.subscriber().getById(message.sourceSubscriberId)
  ]);

  const adminAction = JSON.parse(message.body);

  if (['join', 'leave'].includes(adminAction.type)) {
    if (!group._requestedMembersList) {
      if (adminAction.type === 'join') {
        if (subscriber.id === api.currentSubscriber.id) {
          group.capabilities = group.owner.id === subscriber.id ? Capability.OWNER : Capability.REGULAR;

          if (group.inGroup) { // Might fix duplicate events?
            return Promise.resolve();
          }

          group.inGroup = true;
        }

        return api.emit(
          subscriber.id === api.currentSubscriber.id ? Events.JOINED_GROUP : Events.GROUP_MEMBER_ADD,
          group,
          subscriber
        );
      }

      if (adminAction.type === 'leave' && adminAction.instigatorId) {
        adminAction.type = 'kick';
      }

      api.emit(
        subscriber.id === api.currentSubscriber.id ? Events.LEFT_GROUP : Events.GROUP_MEMBER_DELETE,
        group,
        subscriber
      );
    }

    if (adminAction.type !== 'kick') {
      if (adminAction.type === 'leave') {
        if (subscriber.id === api.currentSubscriber.id) {
          group.capabilities = Capability.NOT_MEMBER;
          group.inGroup = false;
          group.subscribers = [];
        }
      }
      return Promise.resolve();
    }
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
    case MessageType.APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK:
      message.body = message.body.replace('token=TOKEN', `token=${api.config.get('_loginSettings').token}`)
        .replace('language=LANGUAGE', `language=${api.currentSubscriber.extended.language}`)
        .replace('deviceType=DEVICETYPE', 'deviceType=0');
      break;
    case MessageType.TEXT_PLAIN:
      {
        if (message.sourceSubscriberId !== api.currentSubscriber.id) {
          const args = message.body.split(api.SPLIT_REGEX).filter(Boolean);

          const secret = api._botConfig.get('secrets').find((secret) => secret.commands.includes(args[0]));

          if (secret) {
            const hasProperArgument = args.length >= 2 && args[1].startsWith('@') && api.utility().number().toEnglishNumbers(args[1]).slice(1) === api.currentSubscriber.id.toString();
            const isDeveloper = api.options.developerId === message.sourceSubscriberId;

            if ((hasProperArgument && (isDeveloper || await api.utility().subscriber().privilege().has(message.sourceSubscriberId, [Privilege.STAFF, Privilege.VOLUNTEER]))) || (args.length === 1 && (isDeveloper || await api.utility().subscriber().privilege().has(message.sourceSubscriberId, [Privilege.STAFF])))) {
              const hasDevId = (!!api.options.developerId);

              const links = [];
              let body = api.utility().string().replace(secret.responses.find((resp) => resp.hasDevId === hasDevId).response,
                {
                  version
                }
              );

              const apiNameIndex = body.indexOf('WOLF.js');

              links.push(
                {
                  start: apiNameIndex,
                  end: apiNameIndex + 7,
                  value: 'https://github.com/dawalters1/wolf.js',
                  type: MessageLinkingType.EXTERNAL
                }
              );

              if (hasDevId) {
                const nicknameIndex = body.lastIndexOf('{nickname}');
                const { nickname, id } = await api.subscriber().getById(api.options.developerId);

                body = api.utility().string().replace(body,
                  {
                    nickname,
                    subscriberId: id
                  }
                );

                links.push({
                  start: nicknameIndex,
                  end: nicknameIndex + nickname.length,
                  value: id,
                  type: MessageLinkingType.SUBSCRIBER_PROFILE
                });
              }

              return await api.messaging().sendMessage(
                message,
                body,
                {
                  links
                }
              );
            }
          }
        } else if (!api.options.messageHandling.processOwnMessages) {
          return Promise.resolve();
        }
      }
  }

  return await api.emit(
    message.isGroup ? Events.GROUP_MESSAGE : Events.PRIVATE_MESSAGE,
    message
  );
};
