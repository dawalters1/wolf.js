import BaseEvent from './BaseEvent.js';
import ChannelMember from '../../../entities/ChannelMember.js';
import { ChannelMemberCapability, Language, MessageType } from '../../../constants/index.js';
import ChannelOwner from '../../../entities/ChannelOwner.js';
import Message from '../../../entities/Message.js';

const getMemberCapability = (user, channel, type) => {
  switch (type) {
    case 'join':
      return channel.owner.id === user.id
        ? ChannelMemberCapability.OWNER
        : ChannelMemberCapability.REGULAR;
    case 'leave':
    case 'kick':
      return ChannelMemberCapability.NONE;
    case 'banned':
    case 'ban':
      return ChannelMemberCapability.BANNED;
    case 'admin':
      return ChannelMemberCapability.ADMIN;
    case 'silence':
      return ChannelMemberCapability.SILENCED;
    case 'mod':
      return ChannelMemberCapability.MOD;
    case 'reset':
      return ChannelMemberCapability.REGULAR;
    case 'owner':
      return ChannelMemberCapability.OWNER;
    case 'co-owner':
      return ChannelMemberCapability.CO_OWNER;
  }
};

export default class MessageEvent extends BaseEvent {
  constructor (client) {
    super(client, 'message send');
  }

  async #handleGroupAction (message) {
    const [user, channel] = await Promise.all(
      [
        this.client.user.fetch(message.sourceUserId),
        this.client.channel.fetch(message.targetChannelId)
      ]
    );

    const action = JSON.parse(message.body);

    const type = action.type === 'leave' && action.instigatorId
      ? 'kick'
      : action.type;

    const isMe = message.sourceUserId === this.client.me.id;

    const newChannelMember = new ChannelMember(
      this.client,
      {
        id: message.sourceUserId,
        groupId: message.targetChannelId,
        hash: (await message.user()).hash,
        capabilities: getMemberCapability(user, channel, type)
      }
    );

    switch (type) {
      case 'join':
        if (isMe) {
          channel.isMember = true;
          channel.capabilities = newChannelMember.capabilities;
        }

        channel.memberStore.set(newChannelMember);

        return this.client.emit(
          isMe
            ? 'joinedChannel'
            : 'channelMemberJoined',
          channel,
          isMe
            ? null
            : newChannelMember
        );

      case 'kick':
      case 'leave':
        if (isMe) {
          channel.isMember = false;
          channel.capabilities = newChannelMember.capabilities;
          channel.memberStore.clear();
        }

        channel.memberStore.delete((item) => item.id === user.id);

        return this.client.emit(
          isMe
            ? 'leftChannel'
            : 'channelMemberLeft',
          channel,
          isMe
            ? null
            : newChannelMember
        );

      case 'co-owner':
      case 'owner':
      case 'admin':
      case 'mod':
      case 'reset':
      case 'silence':
      case 'ban': {
        if (isMe) {
          channel.isMember = newChannelMember.capabilities !== ChannelMemberCapability.BANNED;
          channel.capabilities = newChannelMember.capabilities;

          if (!channel.isMember) {
            channel.memberStore.clear();
          }
        }

        if (newChannelMember.capabilities === ChannelMemberCapability.OWNER) {
          channel.owner = new ChannelOwner(this.client, user);
        }

        const channelMember = channel.memberStore.get((item) => item.id === user.id);
        const oldChannelMember = channelMember?.clone() ?? null;

        if (channelMember === null) {
          channel.memberStore.set(newChannelMember);
        } else {
          channelMember?._onCapabilityUpdate?.(newChannelMember.capabilities);
        }

        return this.client.emit(
          'channelMemberUpdated',
          channel,
          oldChannelMember,
          channelMember ?? newChannelMember
        );
      }
    }
  }

  async process (data) {
    const message = new Message(this.client, data);

    switch (message.mimeType) {
      case MessageType.PM_REQUEST_RESPONSE:
        return this.client.emit(
          'userPrivateMessageAccept',
          { userId: message.sourceUserId }
        );
      case MessageType.INTERACTIVE_MESSAGE_PACK:
        message.body = message.body
          .replace('token=TOKEN', `token=${this.client.config.framework.login.token}`)
          .replace('language=LANGUAGE', `language=${this.client.me && this.client.me.extended
            ? this.client.me.extended.language
            : Language.ENGLISH} `)
          .replace('platform=PLATFORM', `platform=${this.client.config.framework.connection.query.device}`) // Replaces deviceType
          .replace('deviceType=DEVICETYPE', 'deviceType=wjs');
        break;
      case MessageType.GROUP_ACTION:
        await this.#handleGroupAction(message);
        break;
      default:
        break;
    }

    if (message.sourceUserId === this.client.me?.id && this.client.config.framework.messages.ignore.self) { return this.client.log.debug('[Message]: Message from self ignoring'); }

    const events = [message.isChannel
      ? 'channelMessage'
      : 'privateMessage', 'message'];

    return events.map((event) =>
      this.client.emit(event, message)
    );
  }
}
