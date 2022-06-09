const { Command, MessageTypes, MessageType } = require('../../constants');
const Base = require('../Base');
const Subscription = require('./Subscription');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const fileType = require('file-type');

const nanoid = require('nanoid');

// eslint-disable-next-line no-unused-vars
const validateOptions = (options) => {
  const _options = Object.assign({}, options);

  // TODO:

  return _options;
};

class Messaging extends Base {
  constructor (client) {
    super(client);

    this.subscription = new Subscription(client);
  }

  async _subscribeToGroup () {
    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_SUBSCRIBE, {
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
      Command.MESSAGE_PRIVATE_SUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async _unsubscribeFromPrivate () {
    return await this.client.websocket.emit(
      Command.MESSAGE_PRIVATE_UNSUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async _sendMessage (targetType, targetId, content, options = undefined) {
    if (!Object.values(MessageTypes).includes(targetType)) {
      throw new WOLFAPIError('Unknown Message Target', { targetType });
    }

    if (validator.isNullOrUndefined(targetId)) {
      throw new WOLFAPIError('targetId cannot be null or undefined', { targetId });
    } else if (!validator.isValidNumber(targetId)) {
      throw new WOLFAPIError('targetId must be a valid number', { targetId });
    } else if (validator.isLessThanOrEqualZero(targetId)) {
      throw new WOLFAPIError('targetId cannot be less than or equal to 0', { targetId });
    }

    if (validator.isNullOrUndefined(content)) {
      throw new WOLFAPIError('content cannot be null or undefined', { content });
    }

    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const messageConfig = this.client._botConfig.get('multimedia.messaging');
      if (!messageConfig.mimeTypes.includes(mimeType)) {
        throw new WOLFAPIError('mimeType is unsupported', mimeType);
      }

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

    // const _options = validateOptions(options);

    // TODO:
  }

  async sendGroupMessage (targetGroupId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.GROUP, targetGroupId, content, options);
  }

  async sendPrivateMessage (targetSubscriberId, content, options = undefined) {
    return await this._sendMessage(MessageTypes.PRIVATE, targetSubscriberId, content, options);
  }

  async sendMessage (commandOrMessage, content, options = undefined) {
    if (!(commandOrMessage instanceof require('../../models/CommandContext')) && !(commandOrMessage instanceof require('../../models/Message'))) {
      throw new WOLFAPIError('commandOrMessage must be an instance of command or message', { commandOrMessage });
    }
    return await this._sendMessage(commandOrMessage.isGroup ? MessageTypes.GROUP : MessageTypes.PRIVATE, commandOrMessage.isGroup ? commandOrMessage.targetGroupId : commandOrMessage.sourceSubscriberId, content, options);
  }

  async getGroupMessageEditHistory (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        recipientId: targetGroupId,
        timestamp
      }
    );

    return response?.body ?? [];
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        metadata:
        {
          isDeleted: true
        },
        recipientId: targetGroupId,
        timestamp
      }
    );
  }

  async restoreGroupMessage (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', { timestamp });
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', { timestamp });
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', { timestamp });
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        isGroup: true,
        metadata:
        {
          isDeleted: false
        },
        recipientId: targetGroupId,
        timestamp
      }
    );
  }
}

module.exports = Messaging;
