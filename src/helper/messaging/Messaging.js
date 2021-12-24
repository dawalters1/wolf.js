const { Commands, MessageTypes, EmbedType, MessageLinkingType } = require('../../constants');
const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const fileType = require('file-type');
const { v4: uuidv4 } = require('uuid');

const Message = require('../../models/MessageObject');
const MessageSubscription = require('./MessageSubscription');

const inRange = (start, end, value) => ((value - start) * (value - end) <= 0);

const getDefaultOptions = (api, opts) => {
  const _opts = Object.assign({}, opts);

  _opts.chunkSize = typeof _opts.chunkSize === 'number' ? parseInt(_opts.chunkSize) : 1000;

  _opts.chunk = typeof _opts.chunk === 'boolean' ? _opts.chunk : true;

  _opts.includeEmbeds = typeof _opts.includeEmbeds === 'boolean' ? _opts.includeEmbeds : false;

  _opts.links = _opts.links && Array.isArray(_opts.links) ? _opts.links : [];

  _opts.links.forEach(link => {
    if (validator.isNullOrUndefined(link.start)) {
      throw new Error('start cannot be null or undefined');
    } else if (!validator.isValidNumber(link.start)) {
      throw new Error('start must be a valid number');
    } else if (validator.isLessThanZero(link.start)) {
      throw new Error('start cannot be less than 0');
    }
    if (validator.isNullOrUndefined(link.end)) {
      throw new Error('end cannot be null or undefined');
    } else if (!validator.isValidNumber(link.end)) {
      throw new Error('end must be a valid number');
    } else if (validator.isLessThanZero(link.end)) {
      throw new Error('end cannot be less than 0');
    } else if (link.end < link.start) {
      throw new Error('end must be larger than start');
    }

    if (validator.isNullOrUndefined(link.type)) {
      throw new Error('type cannot be null or undefined');
    } else if (validator.isNullOrWhitespace(link.type)) {
      throw new Error('type cannot be null or empty');
    } else if (!Object.values(MessageLinkingType).includes(link.type)) {
      throw new Error('type is not valid');
    }

    if (validator.isNullOrUndefined(link.value)) {
      throw new Error('value cannot be null or undefined');
    } else if (validator.isNullOrWhitespace(link.value)) {
      throw new Error('value cannot be null or empty');
    }
  });

  const lengthValidation = api._botConfig.get('validation.messaging.length');

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

    this._messageSubscription = new MessageSubscription(this._api);
  }

  subscribe () {
    return this._messageSubscription;
  }

  async _messageGroupSubscribe () {
    return await this._websocket.emit(
      Commands.MESSAGE_GROUP_SUBSCRIBE, {
        headers: {
          version: 4
        }
      }
    );
  }

  async _messageGroupUnsubscribe (id) {
    return await this._websocket.emit(
      Commands.MESSAGE_GROUP_UNSUBSCRIBE, {
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
      Commands.MESSAGE_PRIVATE_SUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async _messagePrivateUnsubscribe () {
    return await this._websocket.emit(
      Commands.MESSAGE_PRIVATE_UNSUBSCRIBE, {
        headers: {
          version: 2
        }
      }
    );
  }

  async getConversationList (timestamp = undefined) {
    try {
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }
      const result = await this._websocket.emit(
        Commands.MESSAGE_CONVERSATION_LIST,
        {
          headers: {
            version: 3
          },
          body: {
            timestamp
          }
        }
      );

      return result.success ? result.body.map((message) => new Message(this._api, message)) : [];
    } catch (error) {
      error.internalErrorMessage = `api.messaging().getConversationList(timestamp=${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  async _sendMessage (targetType, targetId, content, opts = {}) {
    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

    const multiMediaMimes = this._api._botConfig.get('multimedia.messaging.validation.mimes');

    if (multiMediaMimes.includes(mimeType)) {
      return await this._api.multiMediaService().sendMessage(targetType, targetId, content, mimeType);
    }

    if (!this._api._botConfig.get('validation.messaging.mimes').includes(mimeType)) {
      throw new Error('mimeType is not supported');
    }

    const lengthValidation = this._api._botConfig.get('validation.messaging.length');
    const _opts = getDefaultOptions(this._api, opts);

    if (!_opts.chunk && content.length > lengthValidation.max) {
      console.warn(`[WARNING]: Message Helper - Maximum message length is ${lengthValidation.max}`);
    }

    const protocols = this._api._botConfig.get('validation.link.protocols');

    let previewAdded = false;

    const chunks = this._api.utility().string().chunk(content.split(' ').filter(Boolean).join(' '), _opts.chunk ? _opts.chunkSize : content.length, ' ', ' ');

    const bodies = await chunks.reduce(async (result, value, index) => {
      const body = {
        recipient: targetId,
        isGroup: targetType === MessageTypes.GROUP,
        mimeType,
        data: Buffer.from(value, 'utf8'),
        flightId: uuidv4(),
        metadata: undefined,
        embeds: undefined
      };

      const currentStartIndex = chunks.slice(0, index).join(' ').length + index;

      const ads = this._api.utility().string().getAds(value);

      const links = value.split(' ').reduce((result, link, index) => {
        const links = _opts.links.filter((link) => !ads.some((ad) => inRange(ad.index, ad.index + ad[0].length, link.start) && inRange(ad.index, ad.index + ad[0].length, link.end)) && link.start >= currentStartIndex && link.end <= currentStartIndex + value.length);

        if (links.length > 0) {
          links.forEach((link) => {
            if (result.some((linkObj) => linkObj.startsAt === link.start - currentStartIndex && linkObj.endsAt === link.end - currentStartIndex)) {
              return result;
            }

            result.push(
              {
                startsAt: link.start - currentStartIndex,
                endsAt: link.end - currentStartIndex,
                url: link.type !== MessageLinkingType.EXTERNAL
                  ? this._api.utility().string().replace(this._api._botConfig.get('deeplinks')[link.type],
                    {
                      value: link.value
                    }
                  )
                  : link.value
              }
            );
          });
        } else {
          if (validator.isValidUrl(this._api, link)) {
            const url = this._api.utility().string().getValidUrl(link);
            if (url) {
              url.startsAt = value.indexOf(link, index);
              url.endsAt = value.indexOf(link, index) + link.length;
              result.push(url);
            }
          }
        }
        index++;

        return result;
      }, []);

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
                start: value.startsAt,
                end: value.endsAt,
                url: value.url
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
              if (item.url.startsWith('wolf://')) {
                return await result;
              }

              const metadata = await this._api.getLinkMetadata(item.url);

              if (metadata.success && !metadata.body.isBlacklisted) {
                const preview = {
                  type: !metadata.body.title && metadata.body.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
                  url: protocols.some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
                };

                if (preview.type === EmbedType.LINK_PREVIEW) {
                  if (!metadata.body.title) {
                    return result;
                  }

                  preview.title = metadata.body.title || '-';
                  preview.body = metadata.body.description || '-';
                }

                (await result).push(preview);
              }
            } else if (Reflect.has(item, 'groupId')) {
              (await result).push(
                {
                  type: EmbedType.GROUP_PREVIEW,
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
      responses.push(await this._websocket.emit(Commands.MESSAGE_SEND, body));
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
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessage(MessageTypes.GROUP, targetGroupId, content, opts);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().sendGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, content=${JSON.stringify(validator.isBuffer(content) ? 'Buffer -- Too long to display' : content)}, opts=${JSON.stringify(opts)})`;
      throw error;
    }
  }

  async sendPrivateMessage (targetSubscriberId, content, opts = {}) {
    try {
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessage(MessageTypes.PRIVATE, targetSubscriberId, content, opts);
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

      return await this._sendMessage(commandOrMessage.isGroup ? MessageTypes.GROUP : MessageTypes.PRIVATE, commandOrMessage.isGroup ? commandOrMessage.targetGroupId : commandOrMessage.sourceSubscriberId, content, opts);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().sendMessage(commandOrMessage=${commandOrMessage}, content=${JSON.stringify(validator.isBuffer(content) ? 'Buffer -- Too long to display' : content)}, opts=${JSON.stringify(opts)})`;
      throw error;
    }
  }

  async deleteGroupMessage (targetGroupId, timestamp) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.MESSAGE_UPDATE,
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
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.MESSAGE_UPDATE,
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
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.MESSAGE_UPDATE_LIST,
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
    return this._messageSubscription.nextMessage(predicate, timeout);
  }

  async subscribeToNextGroupMessage (targetGroupId, timeout = Infinity) {
    return this._messageSubscription.nextGroupMessage(targetGroupId, timeout);
  }

  async subscribeToNextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    return this._messageSubscription.nextPrivateMessage(sourceSubscriberId, timeout);
  }

  async subscribeToNextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    return this._messageSubscription.nextGroupSubscriberMessage(targetGroupId, sourceSubscriberId, timeout);
  }
}

module.exports = Messaging;
