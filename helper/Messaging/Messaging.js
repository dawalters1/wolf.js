const Helper = require('../Helper');
const validator = require('@dawalters1/validator');
const fileType = require('file-type');

const targetTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const typesToUseMMS = [
  'image/jpeg',
  'image/gif',
  'audio/aac',

  'audio/mpeg'
];

const supportedMessageTypes = [
  'text/plain',
  'image/jpeg',
  'image/gif'
];

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');
const uploadToMediaService = require('../../utils/uploadToMediaService');
const routes = require('@dawalters1/wolf.js.mms/constants/routes');

module.exports = class Messaging extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async _messageGroupSubscribe () {
    try {
      return await this._websocket.emit(request.MESSAGE_GROUP_SUBSCRIBE, {
        headers: {
          version: 4
        }
      });
    } catch (error) {
      error.method = 'Helper/Messaging/_messageGroupSubscribe()';
      throw error;
    }
  }

  async _messageGroupUnsubscribe (id) {
    try {
      return await this._websocket.emit(request.MESSAGE_GROUP_UNSUBSCRIBE, {
        headers: {
          version: 4
        },
        body: {
          id
        }
      });
    } catch (error) {
      error.method = 'Helper/Messaging/_messageGroupUnsubscribe()';
      throw error;
    }
  }

  async _messagePrivateSubscribe () {
    try {
      return await this._websocket.emit(request.MESSAGE_PRIVATE_SUBSCRIBE, {
        headers: {
          version: 2
        }
      });
    } catch (error) {
      error.method = 'Helper/Messaging/_messagePrivatesubscribe()';
      throw error;
    }
  }

  async _sendMessage (targetType, targetId, content, includeEmbeds = false) {
    try {
      const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

      if (typesToUseMMS.includes(mimeType)) {
        return await uploadToMediaService(this._bot, routes.MESSAGE_SEND, content, mimeType, targetId, targetType === targetTypes.GROUP);
      }

      if (validator.isNullOrWhitespace(mimeType)) {
        throw new Error('mimeType cannot be null or empty');
      } else if (!supportedMessageTypes.includes(mimeType)) {
        throw new Error('mimeType is not supported');
      }

      const body = {
        recipient: targetId,
        isGroup: targetType === targetTypes.GROUP,
        mimeType,
        data: Buffer.from(content, 'utf8')
      };

      const ads = [...content.matchAll(/\[(.*?)\]/g)] || [];

      const links = [...content.matchAll(/^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/gi)] || [];

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

      return await this._websocket.emit(request.MESSAGE_SEND, body);
    } catch (error) {
      error.method = `Helper/Messaging/_sendMessage(targetType = ${JSON.stringify(targetType)}, targetId = ${JSON.stringify(targetId)}, content = ${JSON.stringify(content)}, includeEmbeds = ${JSON.stringify(includeEmbeds)})`;
      throw error;
    }
  }

  async sendGroupMessage (targetGroupId, content, includeEmbeds = false) {
    try {
      if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot null or empty');
      }

      if (!validator.isValidBoolean(includeEmbeds)) {
        throw new Error('includeEmbeds must be a boolean');
      }

      return await this._sendMessage(targetTypes.GROUP, targetGroupId, content, includeEmbeds);
    } catch (error) {
      error.method = `Helper/Messaging/sendGroupMessage(targetGroupId = ${JSON.stringify(targetGroupId)}, content = ${JSON.stringify(content)}, includeEmbeds = ${JSON.stringify(includeEmbeds)})`;
      throw error;
    }
  }

  async sendPrivateMessage (targetSubscriberId, content, includeEmbeds = false) {
    try {
      if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot null or empty');
      }

      if (!validator.isValidBoolean(includeEmbeds)) {
        throw new Error('includeEmbeds must be a boolean');
      }

      return await this._sendMessage(targetTypes.PRIVATE, targetSubscriberId, content, includeEmbeds);
    } catch (error) {
      error.method = `Helper/Messaging/sendPrivateMessage(targetSubscriberId = ${JSON.stringify(targetSubscriberId)}, content = ${JSON.stringify(content)}, includeEmbeds = ${JSON.stringify(includeEmbeds)})`;
      throw error;
    }
  }

  async sendMessage (commandOrMessage, content, includeEmbeds = false, messageType = constants.messageType.TEXT_PLAIN) {
    try {
      if (typeof (commandOrMessage) !== 'object') {
        throw new Error('command must be an object');
      }

      if (commandOrMessage.isGroup) {
        return await this.sendGroupMessage(commandOrMessage.targetGroupId, content, includeEmbeds, messageType);
      }
      return await this.sendPrivateMessage(commandOrMessage.sourceSubscriberId, content, includeEmbeds, messageType);
    } catch (error) {
      error.method = `Helper/Messaging/sendGroupMessage(commandOrMessage = ${JSON.stringify(commandOrMessage)}, content = ${JSON.stringify(content)}, includeEmbeds = ${JSON.stringify(includeEmbeds)})`;
      throw error;
    }
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    try {
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
    } catch (error) {
      error.method = `Helper/Messaging/deleteGroupMessage(targetGroupId = ${JSON.stringify(targetGroupId)}, timestamp = ${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async restoreGroupMessage (targetGroupId, timestamp) {
    try {
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
    } catch (error) {
      error.method = `Helper/Messaging/restoreGroupMessage(targetGroupId = ${JSON.stringify(targetGroupId)}, timestamp = ${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async getLinkMetadata (link) {
    try {
      if (validator.isNullOrWhitespace(link)) {
        throw new Error('link cannot be null or empty');
      }

      return await this._websocket.emit(request.METADATA_URL, { url: link });
    } catch (error) {
      error.method = `Helper/Messaging/getLinkMetadata(link = ${JSON.stringify(link)})`;
      throw error;
    }
  }
};
