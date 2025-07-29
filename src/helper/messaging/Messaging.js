import { Command, MessageTypes, MessageType, EmbedType } from '../../constants/index.js';
import Base from '../Base.js';
import Subscription from './Subscription.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import { fileTypeFromBuffer } from 'file-type';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { nanoid } from 'nanoid';

/**
 *
 * @param {MessageSendOptions | {}} options
 * @returns {MessageSendOptions}
 */
const validateOptions = (options) => {
  const _options = Object.assign({}, options);

  _options.formatting = typeof _options.formatting === 'object' ? _options.formatting : {};
  _options.formatting.includeEmbeds = typeof _options.formatting.includeEmbeds === 'boolean' ? _options.formatting.includeEmbeds : false;
  _options.formatting.renderAds = typeof _options.formatting.renderAds === 'boolean' ? _options.formatting.renderAds: true;
  _options.formatting.renderLinks = typeof _options.formatting.renderLinks === 'boolean' ? _options.formatting.renderLinks: true;
  _options.formatting.success = typeof _options.formatting.success === 'boolean' ? _options.formatting.success : false;
  _options.formatting.failed = typeof _options.formatting.failed === 'boolean' ? _options.formatting.failed : false;
  _options.formatting.me = typeof _options.formatting.me === 'boolean' ? _options.formatting.me : false;
  _options.formatting.alert = typeof _options.formatting.alert === 'boolean' ? _options.formatting.alert : false;

  if (_options.formatting.me && _options.formatting.alert) {
    throw new models.WOLFAPIError('you cannot /me and /alert the same message', _options.formatting);
  }

  if (_options.formatting.success && _options.formatting.failed) {
    throw new models.WOLFAPIError('you cannot success and fail the same message', _options.formatting);
  }

  return _options;
};

const getFormattingData = async (client, ads, links, opts) => {
  const data = {
    formatting: {
      groupLinks: !opts?.formatting?.renderAds ? 
        [] : 
        await ads.reduce(async (result, ad) => {
          if ((await result).length >= 25) {
            return result;
          }

          (await result).push(
            {
              start: ad.start,
              end: ad.end,
              groupId: (await ad.channel())?.id
            }
          );

          return result;
        }, []),

      links: !opts?.formatting?.renderLinks ? 
        [] :
        links.map((link) =>
          (
            {
              start: link.start,
              end: link.end,
              url: link.link
            }
          )
        )
      }
  };

  if (!data.formatting.groupLinks.length) {
    Reflect.deleteProperty(data.formatting, 'groupLinks');
  }

  if (!data.formatting.links.length) {
    Reflect.deleteProperty(data.formatting, 'links');
  }

  return Object.values(data.formatting).length
    ? data
    : undefined;
};

const getEmbedData = async (client, formatting, options) => {
  if (!formatting || !options.formatting.includeEmbeds) {
    return undefined;
  }

  const { groupLinks, links } = formatting?.formatting;

  for (const item of [...groupLinks ?? [], ...links ?? []].flat().filter(Boolean)) {
    if (Reflect.has(item, 'groupId')) {
      if (item.groupId === undefined) {
        continue;
      }

      return [
        {
          type: EmbedType.GROUP_PREVIEW,
          groupId: item.groupId
        }
      ];
    }

    if (Reflect.has(item, 'url')) {
      if (item.url.startsWith('wolf://')) {
        continue;
      }

      const response = await client.misc.metadata(item.url);

      if (!response.success) {
        continue;
      }

      const metadata = response.body;

      const preview = {
        type: !metadata.title && metadata.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
        url: client._frameworkConfig.get('validation.links.protocols').some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
      };

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.title) {
        preview.title = metadata?.title ?? '-';

        preview.body = metadata?.description ?? '-';
      }

      return [preview];
    }
  }
};

const buildMessages = async (client, recipient, isChannel, content, options) => {
  content = (options.formatting.success ? `(Y) ${content}` : options.formatting.failed ? `(N) ${content}` : content).toString().trim();
  content = (options.formatting.alert ? `/alert ${content}` : options.formatting.me ? `/me ${content}` : content).toString().trim();

  let offset = 0;

  let developerInjectedLinks = [...content.matchAll(/\[(.+?)\]\((.+?)\)/gu)]?.reduce((results, link) => {
    content = content.replace(link[0], link[1]);

    results.push(
      {
        start: link.index - offset,
        end: (link.index + link[1].length) - offset,
        link: link[2]
      }
    );

    offset += (link[0].length - link[1].length);

    return results;
  }, []);

  const messages = [];
  let embedsAttached = false;

  while (true) { // While loop... probably not the best approach ¯\_(ツ)_/¯
    const messageChunk = content.substr(0, developerInjectedLinks.find((link) => link.start < 1000 && link.end > 1000)?.start || client.utility.string.getAds(content)?.find((ad) => ad.start < 1000 && ad.end > 1000)?.start || client.utility.string.getLinks(content)?.find((link) => link.start < 1000 && link.end > 1000)?.start || (() => {
      if (content.length < 1000) {
        return content.length;
      }

      // Ensure splitting is done at a space and not mid word
      const index = content.lastIndexOf(' ', 1000);

      return index === -1 ? 1000 : index;
    })()).trim();

    // Get formatting data for the chunk
    const formatting = await getFormattingData(client, client.utility.string.getAds(messageChunk), [...developerInjectedLinks.filter((link) => link.end <= messageChunk.length), ...client.utility.string.getLinks(messageChunk)], options);

    const embeds = embedsAttached ? undefined : await getEmbedData(client, formatting, options);

    messages.push(
      {
        recipient,
        isGroup: isChannel,
        mimeType: 'text/plain',
        data: Buffer.from(messageChunk, 'utf8'),
        flightId: nanoid(32),
        metadata: formatting,
        embeds
      }
    );

    if (messageChunk.length === content.length) {
      break;
    }

    embedsAttached = embedsAttached || (embeds?.length ?? false);

    content = (options.formatting.alert ? `/alert ${content.slice(messageChunk.length)}` : options.formatting.me ? `/me ${content.slice(messageChunk.length)}` : content.slice(messageChunk.length)).trim();

    developerInjectedLinks = developerInjectedLinks.filter((developerInjectedLinks) => developerInjectedLinks.start >= messageChunk.length).map((link) =>
      (
        {
          ...link,
          start: (link.start - messageChunk.length - 1) + (options.formatting.alert ? 8 : options.formatting.me ? 5 : 0),
          end: (link.end - messageChunk.length - 1) + (options.formatting.alert ? 8 : options.formatting.me ? 5 : 0)
        }
      )
    );
  }

  return messages;
};

class Messaging extends Base {
  constructor (client) {
    super(client);
    this.subscription = new Subscription(client);
  }

  async _subscribeToChannel () {
    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_SUBSCRIBE,
      {
        headers: {
          version: 4
        }
      }
    );
  }

  async _subscribeToGroup () {
    return this._subscribeToChannel();
  }

  async _unsubscribeFromChannel (targetChannelId) {
    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_UNSUBSCRIBE, {
        headers: {
          version: 4
        },
        body: {
          id: parseInt(targetChannelId)
        }
      }
    );
  }

  async _unsubscribeFromGroup (targetChannelId) {
    return this._unsubscribeFromChannel(targetChannelId);
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

  /**
   * Send a message
   * @param {string} targetType
   * @param {Number} targetId
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response>}
   * @private
   */
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

    const mimeType = Buffer.isBuffer(content) ? (await fileTypeFromBuffer(content)).mime : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const messageConfig = this.client._frameworkConfig.get('multimedia.messaging');

      validateMultimediaConfig(messageConfig, content);

      return await this.client.multimedia.request(
        messageConfig,
        {
          data: mimeType === 'audio/x-m4a' || mimeType === 'audio/x-mp4' ? content : content.toString('base64'),
          mimeType: mimeType === 'audio/x-m4a' || mimeType === 'audio/x-mp4' ? 'audio/aac' : mimeType,
          recipient: parseInt(targetId),
          isGroup: targetType === MessageTypes.CHANNEL,
          flightId: nanoid(32)
        }
      );
    }

    options = validateOptions(options);

    if (options.links && options.links.some((link) => link.start > content.length || link.end > content.length)) {
      throw new models.WOLFAPIError('deeplinks start index and end index must be less than or equal to the contents length', { faults: options.links.filter((link) => link.start > content.length || link.end > content.length) });
    }

    const messages = await buildMessages(this.client, targetId, targetType === MessageTypes.CHANNEL, content, options);

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

  /**
   * Send a channel message
   * @param {Number} targetChannelId
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response>}
   */
  async sendChannelMessage (targetChannelId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.CHANNEL, targetChannelId, content, options);
  }

  /**
   * Send a group message
   * @param {Number} targetChannelId
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response>}
   */
  async sendGroupMessage (targetChannelId, content, options = undefined) {
    return await this.sendChannelMessage(targetChannelId, content, options);
  }

  /**
   * Send a private message
   * @param {Number} targetSubscriberId
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response>}
   */
  async sendPrivateMessage (targetSubscriberId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.PRIVATE, targetSubscriberId, content, options);
  }

  /**
   * Send a message based on command or message
   * @param {Command | Message} commandOrMessage
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response>}
   */
  async sendMessage (commandOrMessage, content, options = undefined) {
    if (!(commandOrMessage instanceof (await import('../../models/CommandContext.js')).default) && !(commandOrMessage instanceof (await import('../../models/Message.js')).default)) {
      throw new models.WOLFAPIError('commandOrMessage must be an instance of command or message', { commandOrMessage });
    }

    return await this._sendMessage(commandOrMessage.isChannel ? MessageTypes.CHANNEL : MessageTypes.PRIVATE, commandOrMessage.isChannel ? commandOrMessage.targetChannelId : commandOrMessage.sourceSubscriberId, content, options);
  }

  /**
   * Get message edit history
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Array<MessageUpdate>>}
   */
  async getChannelMessageEditHistory (targetChannelId, timestamp) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new models.WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new models.WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_UPDATE_LIST,
      {
        isGroup: true,
        recipientId: parseInt(targetChannelId),
        timestamp: parseInt(timestamp)
      }
    );

    return response.body?.map((data) => new models.MessageUpdate(this.client, data)) ?? [];
  }

  /**
   * Get message edit history
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Array<MessageUpdate>>}
   */
  async getGroupMessageEditHistory (targetChannelId, timestamp) {
    return await this.getChannelMessageEditHistory(targetChannelId, timestamp);
  }

  /**
   * Delete a channel message
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Response>}
   */
  async deleteChannelMessage (targetChannelId, timestamp) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
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
        recipientId: targetChannelId,
        timestamp
      }
    );
  }

  /**
   * Delete a group message
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Response>}
   */
  async deleteGroupMessage (targetChannelId, timestamp) {
    return await this.deleteChannelMessage(targetChannelId, timestamp);
  }

  /**
   * Restore a delete channel message
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Response>}
   */
  async restoreChannelMessage (targetChannelId, timestamp) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
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
        recipientId: targetChannelId,
        timestamp
      }
    );
  }

  /**
   * Restore a delete group message
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @returns {Promise<Response>}
   */
  async restoreGroupMessage (targetChannelId, timestamp) {
    return await this.restoreChannelMessage(targetChannelId, timestamp);
  }

  /**
   * Get the bots conversation list
   * @returns {Promise<Array<Message>>}
   */
  async getConversationList () {
    const response = await this.client.websocket.emit(
      Command.MESSAGE_CONVERSATION_LIST,
      {
        headers: {
          version: 4
        }
      }
    );

    return response.body?.map((message) => new models.Message(this.client, message)) ?? [];
  }

  _cleanUp (reconnection = false) {
    this.subscription._cleanUp(reconnection);
  }
}

export default Messaging;
