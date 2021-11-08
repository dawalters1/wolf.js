const { request } = require('../../constants');
const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const fileType = require('file-type');
const { v4: uuidv4 } = require('uuid');

const { embedType } = require('@dawalters1/constants');

const targetType = {
  GROUP: 'group',
  PRIVATE: 'private'
};

const getDefaultOptions = (api, opts) => {
  const _opts = Object.assign({}, opts);

  _opts.chunkSize = typeof _opts.chunkSize === 'number' ? parseInt(_opts.chunkSize) : 1000;

  _opts.chunk = typeof _opts.chunk === 'boolean' ? _opts.chunk : true;

  _opts.includeEmbeds = typeof _opts.includeEmbeds === 'boolean' ? _opts.includeEmbeds : false;

  const lengthValidation = api._botConfig.validation.messaging.length;

  if (_opts.chunkSize < lengthValidation.min) {
    console.warn(`[WARNING]: Message Helper - Minimum chunk size is ${lengthValidation.min}`);
    _opts.chunkSize = lengthValidation.min;
  } else if (_opts.chunkSize > lengthValidation.max) {
    console.warn(`[WARNING]: Message Helper - Maximum chunk size is  ${lengthValidation.min}`);
    _opts.chunkSize = lengthValidation.max;
  }

  return _opts;
};

class Messaging extends BaseHelper {
  constructor (api) {
    super(api);

    this._subsciptionData = {
      id: 1,
      defs: {},
      subscriptions: []
    };
  }

  async _messageGroupSubscribe () {
    return await this._websocket.emit(
      request.MESSAGE_GROUP_SUBSCRIBE, {
        headers: {
          version: 4
        }
      }
    );
  }

  async _messageGroupUnsubscribe (id) {
    return await this._websocket.emit(
      request.MESSAGE_GROUP_UNSUBSCRIBE, {
        headers: {
          version: 4
        },
        body: {
          id
        }
      }
    );
  }

  async _messagePrivateSubscribe () {
    return await this._websocket.emit(
      request.MESSAGE_PRIVATE_SUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async _messagePrivateUnsubscribe () {
    return await this._websocket.emit(
      request.MESSAGE_PRIVATE_UNSUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async _sendMessage (targetType, targetId, content, opts = {}) {
    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

    const multimediaMimes = this._api._botConfig.multiemdia.validation.mimes;

    if (multimediaMimes.includes(mimeType)) {
      return await this._api.multiemdia().sendMessage(targetType, targetId, content, mimeType);
    }

    if (!this._api._botConfig.validation.messaging.mimes.includes(mimeType)) {
      throw new Error('mimeType is not supported');
    }

    const lengthValidation = this._api._botConfig.validation.messaging.length;
    const _opts = getDefaultOptions(this._api, opts);

    if (!_opts.chunk && content.length > lengthValidation.max) {
      console.warn(`[WARNING]: Message Helper - Maximum message length is ${lengthValidation.max}`);
    }

    const protocols = this._api._botConfig.validation.links.protocols;

    let previewAdded = false;

    const bodies = await this._api.utility().string().chunk(content, _opts.chunk ? _opts.chunkSize : content.length, ' ', ' ').reduce(async (result, value) => {
      const body = {
        recipient: targetId,
        isGroup: targetType === targetType.GROUP,
        mimeType,
        data: Buffer.from(value, 'utf8'),
        flightId: uuidv4(),
        metadata: undefined,
        embeds: undefined
      };

      const ads = [...value.matchAll(/\[(.+?)\]/g)] || [];

      const links = value.split(' ').filter((url) => this._api.utility().string().isValidUrl(url[0])) || [];

      if (links.length > 0 || ads.length > 0) {
        body.metadata = {
          formatting: {}
        };

        if (ads && ads.length > 0) {
          body.metadata.formatting.groupLinks = await ads.reduce(async (result, value) => {
            const group = await this._api.group().getByName(value[1]);

            (await result).push(
              {
                start: value.index,
                end: value.index + value[0].length,
                groupId: group.exists ? group.id : undefined
              }
            );

            return result;
          }, Promise.resolve([]));
        }

        if (links && links.length > 0) {
          body.metadata.formatting.links = links.reduce((result, value) => {
            result.push(
              {
                start: value.index,
                end: value.index + value[0].length,
                url: value[0]
              }
            );

            return result;
          }, []);
        }

        if (!previewAdded && _opts.includeEmbeds) {
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
              const metadata = await this._api.getLinkMetadata(item.url);

              if (metadata.success && !metadata.body.isBlacklisted) {
                (await result).push(
                  {
                    type: metadata.body.imageSize > 0 ? embedType.IMAGE_PREVIEW : embedType.LINK_PREVIEW,
                    url: protocols.some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`,
                    title: metadata.body.title,
                    body: metadata.body.description
                  }
                );
              }
            } else if (Reflect.has(item, 'groupId')) {
              (await result).push(
                {
                  type: embedType.GROUP_PREVIEW,
                  groupId: item.groupId
                }
              );
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

  async sendGroupMessage (targetGroupId, content, opts = {}) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessage(targetType.GROUP, targetGroupId, content, opts);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().sendGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, content=${JSON.stringify(validator.isBuffer(content) ? 'Buffer -- Too long to display' : content)}, opts=${JSON.stringify(opts)})`;
      throw error;
    }
  }

  async sendPrivateMessage (targetSubscriberId, content, opts = {}) {
    try {
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessage(targetType.PRIVATE, targetSubscriberId, content, opts);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().sendPrivateMessage(targetSubscriberId=${JSON.stringify(targetSubscriberId)}, content=${JSON.stringify(validator.isBuffer(content) ? 'Buffer -- Too long to display' : content)}, opts=${JSON.stringify(opts)})`;
      throw error;
    }
  }

  async sendMessage (commandOrMessage, content, opts = {}) {
    try {
      if (typeof (commandOrMessage) !== 'object') {
        throw new Error('command must be an object');
      }
      if (!Reflect.has(commandOrMessage, 'targetGroupId')) {
        throw new Error('commandOrMessage must contain propery targetGroupId');
      }
      if (!Reflect.has(commandOrMessage, 'sourceSubscriberId')) {
        throw new Error('commandOrMessage must contain propery sourceSubscriberId');
      }
      if (!Reflect.has(commandOrMessage, 'isGroup')) {
        throw new Error('commandOrMessage must contain propery isGroup');
      }

      return await this._sendMessage(commandOrMessage.isGroup ? targetType.GROUP : targetType.PRIVATE, content, opts);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().sendMessage(commandOrMessage=${JSON.stringify(commandOrMessage)}, content=${JSON.stringify(validator.isBuffer(content) ? 'Buffer -- Too long to display' : content)}, opts=${JSON.stringify(opts)})`;
      throw error;
    }
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        request.MESSAGE_UPDATE,
        {
          isGroup: true,
          metadata: {
            isDeleted: true
          },
          recipientId: targetGroupId,
          timestamp
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.messaging().deleteGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async restoreGroupMessage (targetGroupId, timestamp) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        request.MESSAGE_UPDATE,
        {
          isGroup: true,
          metadata: {
            isDeleted: false
          },
          recipientId: targetGroupId,
          timestamp
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.messaging().restoreGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async getGroupMessageEditHistory (targetGroupId, timestamp) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        request.MESSAGE_UPDATE_LIST,
        {
          isGroup: true,
          recipientId: targetGroupId,
          timestamp
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.messaging().getGroupMessageEditHistory(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async subscribeToNextMessage (predicate, timeout = Infinity) {
    if (this._messageSubscriptions.some((subscription) => subscription.predicate === predicate)) {
      return null;
    }

    const subId = this._subsciptionData.id;
    this._subsciptionData.id++;

    this._subsciptionData.subscriptions.push(
      {
        subId,
        predicate,
        timeoutInterval: timeout === Infinity
          ? undefined
          : setTimeout(() => {
            this._subsciptionData.defs[subId].resolve(null);
          }, timeout)
      }
    );

    // eslint-disable-next-line no-new
    const result = await new Promise((resolve, reject) => {
      this._subsciptionData.defs[subId] = { resolve, reject };
    });

    Reflect.deleteProperty(this._deferreds, subId);

    return result;
  }

  async subscribeToNextGroupMessage (targetGroupId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      message.isGroup &&
      message.targetGroupId === targetGroupId
    , timeout);
  }

  async subscribeToNextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      !message.isGroup &&
      message.sourceSubscriberId === sourceSubscriberId
    , timeout);
  }

  async subscribeToNextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    return await this.subscribeToNextMessage((message) =>
      message.isGroup &&
      message.targetGroupId === targetGroupId &&
      message.sourceSubscriberId === sourceSubscriberId
    , timeout);
  }
}

module.exports = Messaging;
