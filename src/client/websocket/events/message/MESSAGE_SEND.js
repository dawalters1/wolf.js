import { MessageType, Event, ServerEvent, Language, Capability } from '../../../../constants/index.js';
import models, { ChannelMemberList, ChannelRoleContainer, ChannelSubscriberUpdate } from '../../../../models/index.js';
import Base from '../Base.js';

const toCapability = (subscriber, channel, type) => {
  switch (type) {
    case 'join':
      return channel.owner.id === subscriber.id ? Capability.OWNER : Capability.REGULAR;
    case 'leave':
    case 'kick':
      return Capability.NOT_MEMBER;
    case 'banned':
    case 'ban':
      return Capability.BANNED;
    case 'co-owner':
      return Capability.COOWNER;
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
    default :
      return 'UNKNOWN';
  }
};

const handleApplicationPalringoChannelAction = async (client, message) => {
  const [subscriber, channel] = await Promise.all(
    [
      client.subscriber.getById(message.sourceSubscriberId),
      client.channel.getById(message.targetChannelId)
    ]
  );

  const action = JSON.parse(message.body);
  const capabilities = toCapability(subscriber, channel, action.type);

  switch (action.type) {
    case 'join':
    {
      await channel.members._onJoin(subscriber, capabilities);

      channel.membersCount++;

      return (subscriber.id === client.currentSubscriber.id ? [Event.JOINED_GROUP, Event.JOINED_CHANNEL] : [Event.GROUP_MEMBER_ADD, Event.CHANNEL_MEMBER_ADD])
        .forEach((event) =>
          client.emit(
            event,
            channel,
            subscriber
          )
        );
    }
    case 'leave':
    case 'kick': // eslint-disable-line padding-line-between-statements
    {
      if (action.type === 'leave' && action.instigatorId) {
        action.type = 'kick';
      }

      if (subscriber.id === client.currentSubscriber.id) {
        channel.capabilities = capabilities;
        channel.inChannel = false;
        channel.members = new ChannelMemberList(client, channel.id);
        channel.roles = new ChannelRoleContainer(client, channel.id);
      }

      await channel.members._onLeave(subscriber, capabilities);
      channel.membersCount--;

      return (subscriber.id === client.currentSubscriber.id ? [Event.LEFT_GROUP, Event.LEFT_CHANNEL] : [Event.GROUP_MEMBER_DELETE, Event.CHANNEL_MEMBER_DELETE])
        .forEach((event) =>
          client.emit(
            event,
            channel,
            subscriber
          )
        );
    }

    case 'owner':
    case 'co-owner':
    case 'admin':
    case 'mod':
    case 'reset':
    case 'silence':
    case 'ban':// eslint-disable-line padding-line-between-statements
    {
      if (subscriber.id === client.currentSubscriber.id) {
        channel.capabilities = capabilities;
      }
      await channel.members._onUpdate(subscriber, capabilities);

      // non-mod+ users do not have access to banned lists
      if (action.type === 'reset' && subscriber.id === client.currentSubscriber.id) {
        channel.members._misc.members.push(...channel.members._banned.members);

        await channel.members._banned.reset();
      }

      return [Event.GROUP_MEMBER_UPDATE, Event.CHANNEL_MEMBER_UPDATE]
        .forEach((event) =>
          client.emit(
            event,
            channel,
            new ChannelSubscriberUpdate(client,
              {
                groupId: channel.id,
                channelId: channel.id,
                sourceId: action.instigatorId,
                targetId: message.sourceSubscriberId,
                action: action.type
              }
            )
          )
        );
    }

    default:
      client.emit(Event.INTERNAL_ERROR, `Unknown Channel Action: ${action.type}`);
  }
};

/**
 * @param {import('../../../WOLF.js').default} this.client
 */
class MessageSend extends Base {
  constructor (client) {
    super(client, ServerEvent.MESSAGE_SEND);
  }

  async process (body) {
    const message = new models.Message(this.client, body);

    switch (message.type) {
    // Why is this its own message type? Flags dammit 🤬
      case MessageType.APPLICATION_PALRINGO_CHANNEL_ACTION:
        await handleApplicationPalringoChannelAction(this.client, message);
        break;
      // Why is this its own message type? Flags dammit 🤬
      case MessageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE:
        this.client.emit(
          Event.PRIVATE_MESSAGE_ACCEPT_RESPONSE,
          await this.client.subscriber.getById(message.sourceSubscriberId)
        );
        break;
      /**
       * Why is this its own message type? Flags dammit 🤬
       * @deprecated
       */
      case MessageType.APPLICATION_PALRINGO_INTERACTIVE_MESSAGE_PACK:
        message.body = message.body
          .replace('token=TOKEN', `token=${this.client.config.get('framework.login').token}`)
          .replace('language=LANGUAGE', `language=${this.client.currentSubscriber?.extended?.language || Language.ENGLISH} `)
          .replace('platform=PLATFORM', `platform=${this.client._frameworkConfig.get('connection.query.device')}`) // Replaces deviceType
          .replace('deviceType=DEVICETYPE', 'deviceType=Unknown'); // Deprecated
        break;
      default:
        if (message.sourceSubscriberId === this.client.currentSubscriber.id && this.client.config.framework.messages.ignore.self) { return false; }
        break;
    }

    return (message.isChannel ? ['message', Event.GROUP_MESSAGE, Event.CHANNEL_MESSAGE] : ['message', Event.PRIVATE_MESSAGE])
      .forEach((event) =>
        this.client.emit(
          event,
          message
        )
      );
  };
}
export default MessageSend;
