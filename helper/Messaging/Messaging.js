const Helper = require('../Helper');
const validator = require('@dawalters1/validator');
const fileType = require('file-type');
const {
  v4: uuidv4
} = require('uuid');

const protocols = ['http', 'https', 'ftp', 'ws', 'wss', 'smtp'];

const targetTypes = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const request = require('../../constants/request');
const constants = require('@dawalters1/constants');

module.exports = class Messaging extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);
  }

  async _messageGroupSubscribe () {
    return await this._websocket.emit(request.MESSAGE_GROUP_SUBSCRIBE, {
      headers: {
        version: 4
      }
    });
  }

  async _messageGroupUnsubscribe (id) {
    return await this._websocket.emit(request.MESSAGE_GROUP_UNSUBSCRIBE, {
      headers: {
        version: 4
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

  async _sendMessage (targetType, targetId, content, includeEmbeds = false) {
    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

    if (['image/jpeg', 'image/gif'].includes(mimeType)) {
      return await this._api._mediaService().sendMessage(targetType, targetId, content, mimeType);
    }

    if (validator.isNullOrWhitespace(mimeType)) {
      throw new Error('mimeType cannot be null or empty');
    } else if (!['text/plain'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const body = {
      recipient: targetId,
      isGroup: targetType === targetTypes.GROUP,
      mimeType,
      data: Buffer.from(content, 'utf8'),
      flightId: uuidv4()
    };

    const ads = [...content.matchAll(/\[(.*?)\]/g)] || [];

    const links = [...content.matchAll(/([\w+]+:\/\/)?([\w\d-]+\.)*[\w-]+[.:]\w+([/?=&#.]?[\w-]+)*\/?/gm)].filter((url) => this._api.utility().isValidUrl(url[0])) || [];

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

          const group = await this._api.group().getByName(value[1]);

          if (group.exists) {
            ad.groupId = group.id;
          }

          (await result).push(ad);

          return result;
        }, Promise.resolve([]));
      }

      if (links && links.length > 0) {
        body.metadata.formatting.links = links.reduce((result, value) => {
          const link = {
            start: value.index,
            end: value.index + value[0].length,
            url: value[0]
          };

          result.push(link);

          return result;
        }, []);
      }

      if (includeEmbeds) {
        const data = [];

        if (body.metadata.formatting.groupLinks && body.metadata.formatting.groupLinks.length > 0) {
          data.push(...body.metadata.formatting.groupLinks);
        }

        if (body.metadata.formatting.links && body.metadata.formatting.links.length > 0) {
          data.push(...body.metadata.formatting.links);
        }

        const embeds = await data.filter(Boolean).sort((a, b) => a.start - b.start).reduce(async (result, item) => {
          // Only 1 embed per message, else the server will throw an error.
          if ((await result).length > 0) {
            return result;
          }

          if (Reflect.has(item, 'url')) {
            const metadata = await this.getLinkMetadata(item.url);

            if (metadata.success && !metadata.body.isBlacklisted) {
              (await result).push(
                {
                  type: metadata.body.imageSize > 0 ? constants.embedType.IMAGE_PREVIEW : constants.embedType.LINK_PREVIEW,
                  url: protocols.some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`,
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
  }

  /**
   * Send a message in a group
   * @param {Number} targetGroupId - The id of the group
   * @param {String} content - The message to send
   * @param {Boolean} includeEmbeds - Show V10.9 embeds for links or ads
   */
  async sendGroupMessage (targetGroupId, content, includeEmbeds = false) {
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
  }

  /**
   * Send a message to a subscriber
   * @param {Number} targetSubscriberId - The id of the subscriber
   * @param {String} content - The message to send
   * @param {Boolean} includeEmbeds - Show V10.9 embeds for links or ads
   */
  async sendPrivateMessage (targetSubscriberId, content, includeEmbeds = false) {
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
  }

  /**
   * Send a message using Command or Message
   * @param {Object} commandOrMessage - The command or message to use
   * @param {Number} targetSubscriberId - The id of the subscriber
   * @param {String} content - The message to send
   * @param {Boolean} includeEmbeds - Show V10.9 embeds for links or ads
   */
  async sendMessage (commandOrMessage, content, includeEmbeds = false) {
    if (typeof (commandOrMessage) !== 'object') {
      throw new Error('command must be an object');
    }

    if (commandOrMessage.isGroup) {
      return await this.sendGroupMessage(commandOrMessage.targetGroupId, content, includeEmbeds);
    }
    return await this.sendPrivateMessage(commandOrMessage.sourceSubscriberId, content, includeEmbeds);
  }

  async acceptPrivateMessageRequest (subscriberId) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    const checkHistory = async (timestamp = 0) => {
      const messageHistory = (await this._api.subscriber().getHistory(subscriberId, timestamp)).body;

      if (messageHistory.length === 0 && timestamp === 0) {
        throw new Error('No conversation history for this subscriber');
      } else if (messageHistory.find((message) => message.type === constants.messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE)) {
        throw new Error('Private message request has already been accepted for this subscriber');
      } else if (timestamp !== 0) {
        throw new Error('Could not determine if subscriber has been filtered by message filter');
      } else if (!messageHistory.some((message) => message.sourceSubscriberId === subscriberId)) {
        return await checkHistory(messageHistory.slice(-1)[0].timestamp);
      } else {
        const lastMessage = messageHistory.filter((message) => message.sourceSubscriberId === subscriberId).slice(-1);

        if (lastMessage) {
          if (lastMessage.metadata) {
            if (!lastMessage.metadata.isSpam) {
              throw new Error('Subscriber has not been filtered by message filter');
            }
          }
        }
      }

      return await this._websocket.emit(request.MESSAGE_SEND, {
        recipient: subscriberId,
        isGroup: false,
        mimeType: constants.messageType.TEXT_PALRINGO_PRIVATE_REQUEST_RESPONSE,
        data: Buffer.from('This message request has been accepted.', 'utf8'),
        flightId: uuidv4()
      });
    };

    return await checkHistory();
  }

  /**
   * Delete a message in a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} timestamp - The timestamp of the message
   */
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

  /**
   * Restore a deleted message in a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} timestamp - The timestamp of the message
   */
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

  /**
   *
   * @param {Number} targetGroupId - The id of the group the message belongs too
   * @param {Number} timestamp - The timestamp belonging to the message
   * @returns
   */
  async getGroupMessageEditHistory (targetGroupId, timestamp) {
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

    return await this._websocket.emit(request.MESSAGE_UPDATE_LIST, {
      isGroup: true,
      recipientId: targetGroupId,
      timestamp
    });
  }

  /**
   * Get information about a url
   * @param {String} link
   */
  async getLinkMetadata (link) {
    if (validator.isNullOrWhitespace(link)) {
      throw new Error('link cannot be null or empty');
    }

    return await this._websocket.emit(request.METADATA_URL, { url: link });
  }
};
