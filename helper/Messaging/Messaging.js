const Helper = require('../Helper');

const validator = require('../../utils/validator');

const targetTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const supportedMessageTypes = [
  'text/plain',
  'image/jpeg'
];

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

module.exports = class Messaging extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async _messageGroupSubscribe () {
    return await this._websocket.emit(request.MESSAGE_GROUP_SUBSCRIBE, {
      headers: {
        version: 3
      }
    });
  }

  async _messageGroupUnsubscribe (id) {
    return await this._websocket.emit(request.MESSAGE_GROUP_UNSUBSCRIBE, {
      headers: {
        version: 3
      },
      body: {
        id
      }
    });
  }

  async _messagePrivateSubscribe () {
    return await this._websocket.emit(request.MESSAGE_PRIVATE_SUBSCRIBE, {
      headers: {
        version: 2
      }
    });
  }

  async _sendMessage (targetType, targetId, content, messageType, includeEmbeds = false) {
    const body = {
      recipient: targetId,
      isGroup: targetType === targetTypes.GROUP,
      mimeType: messageType,
      data: messageType === constants.messageType.TEXT_PLAIN ? Buffer.from(content, 'utf8') : Buffer.from(content)
    };

    if (messageType === constants.messageType.TEXT_PLAIN) {
      const ads = [...content.matchAll(/\[(.*?)\]/g)] || [];
      // ((?:ftp|wss|http|https|.*?)(?:\/\/?))?(www\.)?([^.].+?)(\.[^0-9]{2,63}?|:\d+)(?=\/|$)(.+)?
      const links = [...content.matchAll(/^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/g)] || [];

      if (links.length > 0 || ads.length > 0) {
        body.metadata = {
          formatting: {}
        };
        if (ads && ads.length > 0) {
          body.metadata.formatting.groupLinks = await ads.reduce(async (result, value) => {
            const ad = {
              start: value.index,
              end: value.index + value[0].length
            };

            const group = await this._bot.group().getByName(value[1]);

            if (group.exists) {
              ad.groupId = group.id;
            }

            (await result).push(ad);

            return result;
          }, Promise.resolve([]));
        }

        if (links && links.length > 0) {
          body.metadata.formatting.links = await links.reduce(async (result, value) => {
            const link = {
              start: value.index,
              end: value.index + value[0].length,
              url: value[0]
            };

            (await result).push(link);

            return result;
          }, Promise.resolve([]));
        }

        if (includeEmbeds) {
          const embeds = await body.metadata.formatting.groupLinks.concat(body.metadata.formatting.links).filter(Boolean).sort((a, b) => b.start - a.start).reduce(async (result, item) => {
            if (Reflect.has(item, 'url')) {
              const metadata = await this.getLinkMetadata(item.url);

              if (metadata.success && !metadata.body.isBlacklisted) {
                (await result).push(
                  {
                    type: metadata.body.imageSize > 0 ? constants.embedType.IMAGE_PREVIEW : constants.embedType.LINK_PREVIEW,
                    url: item.url,
                    image: metadata.body.imageSize === 0 || validator.isNullOrWhitespace(metadata.body.imageUrl) ? null : this._bot.utility().download().file(metadata.body.imageUrl),
                    title: metadata.body.title,
                    body: metadata.body.description
                  });
              }
            } else if (Reflect.has(item, 'groupId')) {
              (await result).push({
                type: constants.embedType.GROUP_PREVIEW,
                groupId: item.groupId
              });
            }

            return result;
          }, Promise.resolve([]));

          if (embeds.length > 0) {
            body.embeds = embeds;
          }
        }
      }
    }

    return await this._websocket.emit(request.MESSAGE_SEND, body);
  }

  async sendGroupMessage (targetGroupId, content, includeEmbeds = false, messageType = constants.messageType.TEXT_PLAIN) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(content)) {
      throw new Error('content cannot null or empty');
    }

    if (validator.isNullOrWhitespace(messageType)) {
      throw new Error('messageType cannot be null or empty');
    } else if (!supportedMessageTypes.includes(messageType)) {
      throw new Error('messageType is not supported');
    }

    if (!validator.isValidBoolean(includeEmbeds)) {
      throw new Error('includeEmbeds must be a boolean');
    }

    return await this._sendMessage(targetTypes.GROUP, targetGroupId, content, messageType, includeEmbeds);
  }

  async sendPrivateMessage (targetSubscriberId, content, includeEmbeds = false, messageType = constants.messageType.TEXT_PLAIN) {
    if (!validator.isValidNumber(targetSubscriberId)) {
      throw new Error('targetSubscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new Error('targetSubscriberId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(content)) {
      throw new Error('content cannot null or empty');
    }

    if (validator.isNullOrWhitespace(messageType)) {
      throw new Error('messageType cannot be null or empty');
    } else if (!supportedMessageTypes.includes(messageType)) {
      throw new Error('messageType is not supported');
    }

    if (!validator.isValidBoolean(includeEmbeds)) {
      throw new Error('includeEmbeds must be a boolean');
    }

    return await this._sendMessage(targetTypes.PRIVATE, targetSubscriberId, content, messageType, includeEmbeds);
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }
    if (!validator.isValidNumber(timestamp)) {
      throw new Error('timestamp must be a valid number');
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new Error('timestamp cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.MESSAGE_UPDATE, {
      isGroup: true,
      metadata: {
        isDeleted: true
      },
      recipientId: targetGroupId,
      timestamp
    });
  }

  async restoreGroupMessage (targetGroupId, timestamp) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }
    if (!validator.isValidNumber(timestamp)) {
      throw new Error('timestamp must be a valid number');
    } else if (validator.isLessThanOrEqualZero(timestamp)) {
      throw new Error('timestamp cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.MESSAGE_UPDATE, {
      isGroup: true,
      metadata: {
        isDeleted: false
      },
      recipientId: targetGroupId,
      timestamp
    });
  }

  async getLinkMetadata (link) {
    if (validator.isNullOrWhitespace(link)) {
      throw new Error('link cannot be null or empty');
    }

    return await this._websocket.emit(request.METADATA_URL, { url: link });
  }
};
