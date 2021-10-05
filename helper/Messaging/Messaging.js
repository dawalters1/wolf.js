const Helper = require('../Helper');
const validator = require('../../utils/validator');

const fileType = require('file-type');
const { v4: uuidv4 } = require('uuid');

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

    this._messageSubscriptions = [];
    this._deferreds = {};
    this._subscriptionId = 1;
  }

  _getDefaultOptions (opts) {
    const _opts = Object.assign({}, opts);

    _opts.chunkSize = typeof _opts.chunkSize === 'number' ? parseInt(_opts.chunkSize) : 1000;

    _opts.chunk = typeof _opts.chunk === 'boolean' ? _opts.chunk : true;

    _opts.includeEmbeds = typeof _opts.includeEmbeds === 'boolean' ? _opts.includeEmbeds : false;

    if (_opts.chunkSize < 512) {
      console.warn('[WARNING]: Message Helper - Minimum chunk size is 512');
      _opts.chunkSize = 512;
    } else if (_opts.chunkSize > 1000) {
      console.warn('[WARNING]: Message Helper - Maximum chunk size is 1000');
      _opts.chunkSize = 1000;
    }

    return _opts;
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

  async _sendMessage (targetType, targetId, content, opts = {}) {
    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

    if (['image/jpeg', 'image/gif'].includes(mimeType)) {
      return await this._api._mediaService().sendMessage(targetType, targetId, content, mimeType);
    }

    if (validator.isNullOrWhitespace(mimeType)) {
      throw new Error('mimeType cannot be null or empty');
    } else if (!['text/plain'].includes(mimeType)) {
      throw new Error('mimeType is unsupported');
    }

    const _opts = this._getDefaultOptions(opts);

    if (!_opts.chunk && content.length > 1000) {
      console.warn('[WARNING]: Message Helper - Maximum message length is 1,000');
    }

    let previewAdded = false;

    const bodies = await this._api.utility().string().chunk(content, _opts.chunk ? _opts.chunkSize : content.length, ' ', ' ').reduce(async (result, value) => {
      const body = {
        recipient: targetId,
        isGroup: targetType === targetTypes.GROUP,
        mimeType,
        data: Buffer.from(value, 'utf8'),
        flightId: uuidv4()
      };

      const ads = [...value.matchAll(/\[(.+?)\]/g)] || [];

      const links = [...value.matchAll(/([\w+]+:\/\/)?([\w\d-]+\.)*[\w-]+[.:]\w+([/?=&#.]?[\w-]+)*\/?/gm)].filter((url) => this._api.utility().isValidUrl(url[0])) || [];

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

        if (!previewAdded && _opts.includeEmbeds) {
          const data = []; ;

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
            previewAdded = true;
          }
        }
      }

      (await result).push(body);

      return result;
    }, Promise.resolve([]));

    const responses = [];

    for (const body of bodies) {
      responses.push(await this._websocket.emit(request.MESSAGE_SEND, body));
    };

    return responses.length > 1
      ? {
          code: 207,
          body: responses
        }
      : responses[0];
  }

  /**
   * Send a message in a group
   * @param {Number} targetGroupId - The id of the group
   * @param {String} content - The message to send
   * @param {{chunk: true chunkSize: 1000 includeEmbeds: false}} opts - Message sending options
   */
  async sendGroupMessage (targetGroupId, content, opts) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(content)) {
      throw new Error('content cannot null or empty');
    }

    return await this._sendMessage(targetTypes.GROUP, targetGroupId, content, opts);
  }

  /**
   * Send a message to a subscriber
   * @param {Number} targetSubscriberId - The id of the subscriber
   * @param {String} content - The message to send
   * @param {{chunk: true chunkSize: 1000 includeEmbeds: false}} opts - Message sending options
   */
  async sendPrivateMessage (targetSubscriberId, content, opts) {
    if (!validator.isValidNumber(targetSubscriberId)) {
      throw new Error('targetSubscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new Error('targetSubscriberId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(content)) {
      throw new Error('content cannot null or empty');
    }

    return await this._sendMessage(targetTypes.PRIVATE, targetSubscriberId, content, opts);
  }

  /**
   * Send a message using Command or Message
   * @param {Object} commandOrMessage - The command or message to use
   * @param {Number} targetSubscriberId - The id of the subscriber
   * @param {String} content - The message to send
   * @param {{chunk: true chunkSize: 1000 includeEmbeds: false}} opts - Message sending options
   */
  async sendMessage (commandOrMessage, content, opts) {
    if (typeof (commandOrMessage) !== 'object') {
      throw new Error('command must be an object');
    }

    if (commandOrMessage.isGroup) {
      return await this.sendGroupMessage(commandOrMessage.targetGroupId, content, opts);
    }
    return await this.sendPrivateMessage(commandOrMessage.sourceSubscriberId, content, opts);
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
   * @deprecated Will be removed in 1.0.0 use api/bot.getLinkMeta(link) instead
   */
  async getLinkMetadata (link) {
    if (validator.isNullOrWhitespace(link)) {
      throw new Error('link cannot be null or empty');
    }

    return await this._websocket.emit(request.METADATA_URL, { url: link });
  }

  /**
   * Manually subscribe to a specific message
   * @param {Predicate} predicate - The predicate the message should match
   * @param {Number} timeout - How long the subscription should wait before timing out
   * @returns Promise.resolve(message) OR Promise.resolve(null) - No errors should be thrown
   */
  async subscribeToNextMessage (predicate, timeout = Infinity) {
    if (this._messageSubscriptions.some((subscription) => subscription.predicate === predicate)) {
      return null;
    }

    const subscriptionId = this._subscriptionId;

    this._subscriptionId++;

    this._messageSubscriptions.push(
      {
        subscriptionId,
        predicate,
        timeoutInterval: timeout === Infinity
          ? undefined
          : setTimeout(() => {
            this._deferreds[subscriptionId].resolve(null);
          }, timeout)
      }
    );

    // eslint-disable-next-line no-new
    const result = await new Promise((resolve, reject) => {
      this._deferreds[subscriptionId] = { resolve: resolve, reject: reject };
    });

    Reflect.deleteProperty(this._deferreds, subscriptionId);

    return result;
  }

  /**
   * Manually subscribe to the next message in a group
   * @param {Number} targetGroupId - The ID of the group
   * @param {Number} timeout - How long the subscription should wait before timing out
   * @returns Promise.resolve(message) OR Promise.resolve(null) - No errors should be thrown
   */
  async subscribeToNextGroupMessage (targetGroupId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      message.isGroup && message.targetGroupId === targetGroupId
    , timeout);
  }

  /**
   * Manually subscribe to the next message from a subscriber
   * @param {Number} sourceSubscriberId - The ID of the subscriber
   * @param {Number} timeout - How long the subscription should wait before timing out
   * @returns Promise.resolve(message) OR Promise.resolve(null) - No errors should be thrown
   */
  async subscribeToNextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      !message.isGroup && message.sourceSubscriberId === sourceSubscriberId
    , timeout);
  }

  /**
   * Manually subscribe to the next message in a group from a specific subscriber
   * @param {Number} targetGroupId - The ID of the group
   * @param {Number} sourceSubscriberId - The ID of the subscriber
   * @param {Number} timeout - How long the subscription should wait before timing out
   * @returns Promise.resolve(message) OR Promise.resolve(null) - No errors should be thrown
   */
  async subscribeToNextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      message.isGroup && message.targetGroupId === targetGroupId && message.sourceSubscriberId === sourceSubscriberId
    , timeout);
  }
};
