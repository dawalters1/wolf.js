import { Command, MessageTypes, MessageType, MessageLinkingType, EmbedType } from '../../constants/index.js';
import Base from '../Base.js';
import Subscription from './Subscription.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import fileType from 'file-type';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { nanoid } from 'nanoid';

// eslint-disable-next-line no-unused-vars
const validateOptions = (options) => {
  const _options = Object.assign({}, options);

  _options.includeEmbeds = typeof _options.includeEmbeds === 'boolean' ? _options.includeEmbeds : false;
  _options.links = _options.links && Array.isArray(_options.links) ? _options.links : [];
  _options.formatting = typeof _options.formatting === 'object' ? _options.formatting : {};
  _options.formatting.includeEmbeds = typeof _options.formatting.includeEmbeds === 'boolean' ? _options.formatting.includeEmbeds : false;
  _options.formatting.me = typeof _options.formatting.me === 'boolean' ? _options.formatting.me : false;
  _options.formatting.alert = typeof _options.formatting.alert === 'boolean' ? _options.formatting.alert : false;

  if (_options.formatting.me && _options.formatting.alert) {
    throw new models.WOLFAPIError('you cannot /me and /alert the same message', _options.formatting);
  }

  _options.links.forEach(link => {
    if (validator.isNullOrUndefined(link.start)) {
      throw new models.WOLFAPIError('start cannot be null or undefined', { link });
    } else if (!validator.isValidNumber(link.start)) {
      throw new models.WOLFAPIError('start must be a valid number', { link });
    } else if (!validator.isType(link.start, 'number')) {
      throw new models.WOLFAPIError('start must be type of number', { link });
    } else if (validator.isLessThanZero(link.start)) {
      throw new models.WOLFAPIError('start cannot be less than 0', { link });
    }

    if (validator.isNullOrUndefined(link.end)) {
      throw new models.WOLFAPIError('end cannot be null or undefined', { link });
    } else if (!validator.isValidNumber(link.end)) {
      throw new models.WOLFAPIError('end must be a valid number', { link });
    } else if (!validator.isType(link.end, 'number')) {
      throw new models.WOLFAPIError('end must be type of number', { link });
    } else if (validator.isLessThanZero(link.end)) {
      throw new models.WOLFAPIError('end cannot be less than 0', { link });
    } else if (link.end < link.start) {
      throw new models.WOLFAPIError('end must be larger than start', { link });
    }

    if (validator.isNullOrUndefined(link.type)) {
      throw new models.WOLFAPIError('type cannot be null or undefined', { link });
    } else if (validator.isNullOrWhitespace(link.type)) {
      throw new models.WOLFAPIError('type cannot be null or empty', { link });
    } else if (!Object.values(MessageLinkingType).includes(link.type)) {
      throw new models.WOLFAPIError('type is not valid', { link });
    }

    if (validator.isNullOrUndefined(link.value)) {
      throw new models.WOLFAPIError('value cannot be null or undefined', { link });
    } else if (validator.isNullOrWhitespace(link.value)) {
      throw new models.WOLFAPIError('value cannot be null or empty', { link });
    }
  });

  return _options;
};

const getFormattingData = async (client, message, ads, links) => {
  const data = {
    formatting: {
      groupLinks: await ads.reduce(async (result, ad) => {
        if ((await result).length >= 25) {
          return result;
        }

        (await result).push({
          start: ad.start,
          end: ad.end,
          groupId: (await client.group.getByName(ad.ad))?.id
        });

        return result;
      }, []),
      links: links.map((link) => ({
        start: link.start,
        end: link.end,
        url: link.link
      }))
    }
  };

  if (!data.formatting.groupLinks.length) {
    Reflect.deleteProperty(data.formatting, 'groupLinks');
  }

  if (!data.formatting.links.length) {
    Reflect.deleteProperty(data.formatting, 'links');
  }

  return Object.values(data.formatting).length ? data : undefined;
};

const getEmbedData = async (client, formatting) => {
  for (const item of [...[formatting?.groupLinks ?? []], ...[formatting?.links ?? []]].flat().filter(Boolean)) {
    if (Reflect.has(item, 'groupId')) {
      if (item.groupId === undefined) {
        continue;
      }

      return {
        type: EmbedType.GROUP_PREVIEW,
        groupId: item.groupId
      };
    }

    if (Reflect.has(item, 'url')) {
      if (item.url.startsWith('wolf://')) {
        continue;
      }

      const metadata = await client.metadata(item.url);

      if (!metadata.success || metadata.body.isBlacklisted) {
        continue;
      }

      const preview = {
        type: !metadata.body.title && metadata.body.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
        url: client._botConfig.get('validation.links.protocols').some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
      };

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.body.title) {
        preview.title = metadata.body?.title ?? '-';

        preview.body = metadata.body?.description ?? '-';
      }

      return preview;
    }
  }
};

const buildMessages = async (client, recipient, isGroup, content, options) => {
  content = options.formatting.alert ? `/alert ${content}` : options.formatting.me ? `/me ${content}` : content;

  const messages = [];

  while (true) { // While loop... probably not the best approach ¯\_(ツ)_/¯
    // TODO: Developer injected links
    const messageChunk = content.substr(0, client.utility.string.getAds(content).find((ad) => ad.start < 1000 && ad.end > 1000)?.start || client.utility.string.getLinks(content).find((link) => link.start < 1000 && link.end > 1000)?.start || (() => {
      // Ensure splitting is done at a space and not mid word
      const index = content.lastIndexOf(' ', 1000);

      return index === -1 ? 1000 : index;
    })()).trim();

    // Get formatting data for the chunk
    const formatting = await getFormattingData(client, messageChunk, client.utility.string.getAds(messageChunk), client.utility.string.getLinks(messageChunk));
    const embeds = await getEmbedData(client, formatting);

    messages.push({
      recipient,
      isGroup,
      mimeType: 'text/plain',
      data: Buffer.from(messageChunk, 'utf8'),
      flightId: nanoid(32),
      metadata: formatting,
      embeds
    });

    if (messageChunk.length === content.length) {
      break;
    }

    content = (options.formatting.alert ? `/alert ${content}` : options.formatting.me ? `/me ${content}` : content).slice(messageChunk.length).trim();
  }

  return messages;
};

class Messaging extends Base {
  constructor (client) {
    super(client);
    this.subscription = new Subscription(client);
  }

  async _subscribeToGroup () {
    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_SUBSCRIBE,
      {
        headers: {
          version: 4
        }
      }
    );
  }

  async _unsubscribeFromGroup (targetGroupId) {
    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_UNSUBSCRIBE, {
        headers: {
          version: 4
        },
        body: {
          id: targetGroupId
        }
      }
    );
  }

  async _subscribeToPrivate () {
    return await this.client.websocket.emit(
      Command.MESSAGE_PRIVATE_SUBSCRIBE,
      {
        headers: {
          version: 2
        }
      }
    );
  }

  async _unsubscribeFromPrivate () {
    return await this.client.websocket.emit(
      Command.MESSAGE_PRIVATE_UNSUBSCRIBE,
      {
        headers: {
          version: 2
        }
      }
    );
  }

  async _sendMessage (targetType, targetId, content, options = undefined) {
    if (!Object.values(MessageTypes).includes(targetType)) {
      throw new models.WOLFAPIError('Unknown Message Target', { targetType });
    }

    if (validator.isNullOrUndefined(targetId)) {
      throw new models.WOLFAPIError('targetId cannot be null or undefined', { targetId });
    } else if (!validator.isValidNumber(targetId)) {
      throw new models.WOLFAPIError('targetId must be a valid number', { targetId });
    } else if (validator.isLessThanOrEqualZero(targetId)) {
      throw new models.WOLFAPIError('targetId cannot be less than or equal to 0', { targetId });
    }

    if (validator.isNullOrUndefined(content)) {
      throw new models.WOLFAPIError('content cannot be null or undefined', { content });
    }

    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const messageConfig = this.client._botConfig.get('multimedia.messaging');

      validateMultimediaConfig(messageConfig, content);

      return await this.client.multimedia.upload(messageConfig.route,
        {
          data: mimeType === 'audio/x-m4a' || mimeType === 'audio/x-mp4' ? content : content.toString('base64'),
          mimeType: mimeType === 'audio/x-m4a' || mimeType === 'audio/x-mp4' ? 'audio/aac' : mimeType,
          recipient: parseInt(targetId),
          isGroup: targetType === MessageTypes.GROUP,
          flightId: nanoid(32)
        }
      );
    }

    options = validateOptions(options);

    if (options.links && options.links.some((link) => link.start > content.length || link.end > content.length)) {
      throw new models.WOLFAPIError('deeplinks start index and end index must be less than or equal to the contents length', { faults: options.links.filter((link) => link.start > content.length || link.end > content.length) });
    }

    const messages = await buildMessages(this.client, targetId, targetType === MessageTypes.GROUP, content, options);

    const responses = [];

    for (const message of messages) {
      responses.push(await this.client.websocket.emit(Command.MESSAGE_SEND, message));
    }

    return responses.length > 1
      ? new models.Response(
        {
          code: 207,
          body: responses
        }
      )
      : responses[0];
  }

  async sendGroupMessage (targetGroupId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.GROUP, targetGroupId, content, options);
  }

  async sendPrivateMessage (targetSubscriberId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.PRIVATE, targetSubscriberId, content, options);
  }

  async sendMessage (commandOrMessage, content, options = undefined) {
    if (!(commandOrMessage instanceof (await import('../../models/CommandContext.js')).default) && !(commandOrMessage instanceof (await import('../../models/Message.js')).default)) {
      throw new models.WOLFAPIError('commandOrMessage must be an instance of command or message', { commandOrMessage });
    }

    return await this._sendMessage(commandOrMessage.isGroup ? MessageTypes.GROUP : MessageTypes.PRIVATE, commandOrMessage.isGroup ? commandOrMessage.targetGroupId : commandOrMessage.sourceSubscriberId, content, options);
  }

  async getGroupMessageEditHistory (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        recipientId: targetGroupId,
        timestamp
      }
    );

    return (response?.body ?? []).map((message) => new models.Message(this.client, message));
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        metadata: {
          isDeleted: true
        },
        recipientId: targetGroupId,
        timestamp
      }
    );
  }

  async restoreGroupMessage (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        metadata: {
          isDeleted: false
        },
        recipientId: targetGroupId,
        timestamp
      }
    );
  }
}

export default Messaging;
