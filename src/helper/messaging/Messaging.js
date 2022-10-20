import { Command, MessageTypes, MessageType, MessageLinkingType } from '../../constants/index.js';
import Base from '../Base.js';
import Subscription from './Subscription.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import fileType from 'file-type';
import * as nanoid from 'nanoid';
import messageBuilder from '../../utils/messageBuilder.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';

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

    const responses = await (await messageBuilder(this.client, targetId, targetType === MessageTypes.GROUP, content, options)).reduce(async (result, message) => {
      (await result).push(await this.client.websocket.emit(Command.MESSAGE_SEND, message));

      return result;
    }, []);

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
    if (!(commandOrMessage instanceof (await import('../../models/CommandContext.js')).default) && !(commandOrMessage instanceof (await import('../../models/Message.js')).Message)) {
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
