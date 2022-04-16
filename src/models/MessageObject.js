const patch = require('../utils/Patch');

const { ContextType } = require('../constants');

const toBaseMessage = (api, messageData) => {
  const message = {
    id: messageData.id,
    body: messageData.data.toString().trim(),
    sourceSubscriberId: messageData.originator.id ? messageData.originator.id : messageData.originator,
    targetGroupId: messageData.isGroup ? messageData.recipient.id ? messageData.recipient.id : messageData.recipient : null,
    embeds: messageData.embeds,
    metadata: messageData.metadata,
    isGroup: messageData.isGroup,
    timestamp: messageData.timestamp,
    edited: messageData.edited,
    type: messageData.mimeType
  };

  message.isCommand = api._commandHandler.isCommand(message);

  return message;
};

class Message {
  constructor (api, message) {
    this._api = api;

    patch(this, toBaseMessage(api, message));
  }

  async sendMessage (content, opts = null) {
    return await this._api._messaging.sendMessage(this, content, opts);
  }

  async delete () {
    if (this.isGroup) {
      return await this._api._messaging.deleteGroupMessage(this.targetGroupId, this.timestamp);
    }

    throw new Error('private message deletion is unsupported');
  }

  async restore () {
    if (this.isGroup) {
      return await this._api._messaging.restoreGroupMessage(this.targetGroupId, this.timestamp);
    }

    throw new Error('private message deletion is unsupported');
  }

  async addTip (tips) {
    if (this.isGroup) {
      return await this._api.tipping().tip(
        this.sourceSubscriberId,
        this.targetGroupId,
        {
          type: ContextType.MESSAGE,
          id: this.timestamp
        },
        tips
      );
    }

    throw new Error('private message tipping is unsupported');
  }
}

module.exports = Message;
