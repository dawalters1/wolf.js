const Helper = require('../Helper');

const constants = require('../../constants');
const validator = require('../../utilities/validator');

const targetTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const supportedMessageTypes = [
  'text/plain',
  'image/jpeg'
];

const requests = {
  MESSAGE_SEND: 'message send',
  MESSAGE_GROUP_SUBSCRIBE: 'message group subscribe',
  MESSAGE_PRIVATE_SUBSCRIBE: 'message private subscribe',
  MESSAGE_GROUP_UNSUBSCRIBE: 'message group unsubscribe',
  MESSAGE_UPDATE: 'message update',
  METADATA_URL: 'metadata url',
  MESSAGE_GROUP_HISTORY_LIST: 'message group history list',
  MESSAGE_PRIVATE_HISTORY_LIST: 'message private history list'
};

module.exports = class Messaging extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async _messageGroupSubscribe () {
    return await this._websocket.emit(requests.MESSAGE_GROUP_SUBSCRIBE, {
      headers: {
        version: 3
      }
    });
  }

  async _messageGroupUnsubscribe (id) {
    return await this._websocket.emit(requests.MESSAGE_GROUP_UNSUBSCRIBE, {
      headers: {
        version: 3
      },
      body: {
        id
      }
    });
  }

  async _messagePrivateSubscribe () {
    return await this._websocket.emit(requests.MESSAGE_PRIVATE_SUBSCRIBE, {
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
      data: Buffer.from(content, 'utf8')
    };

    if (messageType === constants.messageType.TEXT_PLAIN) {
      const ads = [...content.matchAll(/\[(.*?)\]/g)];

      const links = [...content.matchAll(/^((?:(ftp|wss|http|https|(.*?)):\/\/)?)(?:(www.)?)(.+?)(\.|:)(.{2,63}?(?=\/|$))(?:(.*?)?)(.*)$/g)];

      if (links.length > 0 || ads.length > 0) {
        body.metadata = {
          formatting: {}
        };
        if (ads.length > 0) {
          body.metadata.formatting.groupLinks = await Promise.all(ads.reduce(async (result, value) => {
            const ad = {
              start: value.index,
              end: value.index + value[0].length
            };

            const group = await this._bot.group().getByName(ad);

            if (group.exists) {
              ad.groupId = group.id;
            }

            (await result).push(ad);

            return result;
          }, Promise.resolve([])));
        }

        if (links.length > 0) {
          body.metadata.formatting.links = await Promise.all(links.reduce(async (result, value) => {
            const link = {
              start: value.index,
              end: value.index + value[0].length,
              url: value[0]

            };

            (await result).push(link);

            return result;
          }, Promise.resolve([])));
        }

        if (includeEmbeds) {
          const embeds = body.formatting.ads.concat(body.formatting.links).sort((a, b) => b.start - a.start).reduce((result, item) => {
            if (Reflect.has(item, 'url')) {
              const metadata = this.getLinkMetadata(item.url);

              if (metadata.success && !metadata.body.isBlacklisted) {
                (result).push(
                  {
                    type: metadata.body.imageSize > 0 ? constants.embedType.IMAGE_PREVIEW : constants.embedType.LINK_PREVIEW,
                    url: item.url,
                    image: metadata.body.imageSize === 0 || validator.isNullOrWhitespace(metadata.body.imageUrl) ? null : '', // TODO: Download Image
                    title: metadata.body.title,
                    body: metadata.body.description
                  });
              }
            } else if (Reflect.has(item, 'groupId')) {
              (result).push({
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

    return await this._websocket.emit(requests.MESSAGE_SEND, body);
  }

  async sendGroupMessage (targetGroupId, content, messageType = constants.messageType.TEXT_PLAIN, includeEmbeds = false) {
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

  async sendPrivateMessage (targetSubscriberId, content, messageType = constants.messageType.TEXT_HTML, includeEmbeds = false) {
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

    return await this._websocket.emit(requests.MESSAGE_UPDATE, {
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

    return await this._websocket.emit(requests.MESSAGE_UPDATE, {
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

    return await this._websocket.emit(requests.METADATA_URL, { url: link });
  }
};
