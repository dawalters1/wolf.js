const { Command } = require('../../constants');
const Base = require('../Base');
const Subscription = require('./Subscription');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');

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

  }

  async sendGroupMessage (targetGroupId, content, options = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }
  }

  async sendPrivateMessage (targetSubscriberId, content, options = undefined) {
    if (validator.isNullOrUndefined(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be null or undefined', targetSubscriberId);
    } else if (!validator.isValidNumber(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId must be a valid number', targetSubscriberId);
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be less than or equal to 0', targetSubscriberId);
    }
  }

  async sendMessage (commandOrMessage, content, options = undefined) {

  }

  async getGroupMessageEditHistory (targetGroupId, timestamp) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', timestamp);
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', timestamp);
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', timestamp);
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
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', timestamp);
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', timestamp);
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', timestamp);
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
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be null or undefined', timestamp);
    } else if (!validator.isValidNumber(timestamp)) {
      throw new WOLFAPIError('timestamp must be a valid number', timestamp);
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new WOLFAPIError('timestamp cannot be less than or equal to 0', timestamp);
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
