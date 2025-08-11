const { Commands, MessageTypes, EmbedType, MessageLinkingType, Events } = require('../../constants');
const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');
const fileType = require('file-type');
const { v4: uuidv4 } = require('uuid');

const Message = require('../../models/MessageObject');
const MessageSubscription = require('./MessageSubscription');
const ResponseObject = require('../../models/ResponseObject');

const inRange = (start, end, value) => ((value - start) * (value - end) <= 0);

const validateV2Options = (options) => {
  const _options = Object.assign({}, options);

  _options.formatting = typeof _options.formatting === 'object' ? _options.formatting : {};
  _options.formatting.includeEmbeds = typeof _options.formatting.includeEmbeds === 'boolean' ? _options.formatting.includeEmbeds : true;
  _options.formatting.success = typeof _options.formatting.success === 'boolean' ? _options.formatting.success : false;
  _options.formatting.failed = typeof _options.formatting.failed === 'boolean' ? _options.formatting.failed : false;
  _options.formatting.me = typeof _options.formatting.me === 'boolean' ? _options.formatting.me : false;
  _options.formatting.alert = typeof _options.formatting.alert === 'boolean' ? _options.formatting.alert : false;

  if (_options.formatting.me && _options.formatting.alert) {
    throw new Error('you cannot /me and /alert the same message', _options.formatting);
  }

  if (_options.formatting.success && _options.formatting.failed) {
    throw new Error('you cannot success and fail the same message', _options.formatting);
  }

  return _options;
};

const getDefaultOptions = (api, opts) => {
  const _options = Object.assign({}, opts);

  if (_options.chunk || _options.chunkSize) {
    console.warn('[WARNING]: Message Helper - opts.chunk and opts.chunkSize are deprecated and will be removed in 2.0');
  }

  _options.chunkSize = typeof _options.chunkSize === 'number' ? parseInt(_options.chunkSize) : 1000;

  _options.chunk = typeof _options.chunk === 'boolean' ? _options.chunk : true;

  if (_options.links) {
    console.warn('[WARNING]: Message Helper - opts.links is deprecated please use [content](url) approach instead');
  }

  _options.links = _options.links && Array.isArray(_options.links) ? _options.links : [];

  _options.formatting = typeof _options.formatting === 'object' ? _options.formatting : {};

  _options.formatting.includeEmbeds = typeof _options.formatting.includeEmbeds === 'boolean' ? _options.formatting.includeEmbeds : false;

  _options.formatting.me = typeof _options.formatting.me === 'boolean' ? _options.formatting.me : false;

  _options.formatting.alert = typeof _options.formatting.alert === 'boolean' ? _options.formatting.alert : false;

  if (_options.formatting.me && _options.formatting.alert) {
    throw new Error('Message Helper - you cannot /me and /alert the same message');
  }

  _options.links.forEach(link => {
    if (validator.isNullOrUndefined(link.start)) {
      throw new Error('start cannot be null or undefined');
    } else if (!validator.isValidNumber(link.start)) {
      throw new Error('start must be a valid number');
    } else if (!validator.isType(link.start, 'number')) {
      throw new Error('start must be type of number');
    } else if (validator.isLessThanZero(link.start)) {
      throw new Error('start cannot be less than 0');
    }
    if (validator.isNullOrUndefined(link.end)) {
      throw new Error('end cannot be null or undefined');
    } else if (!validator.isValidNumber(link.end)) {
      throw new Error('end must be a valid number');
    } else if (!validator.isType(link.end, 'number')) {
      throw new Error('end must be type of number');
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

  if (_options.chunkSize < lengthValidation.min) {
    this._api.emit(Events.INTERNAL_ERROR, `[WARNING]: Message Helper - Minimum chunk size is ${lengthValidation.min}`);
    _options.chunkSize = lengthValidation.min;
  } else if (_options.chunkSize > lengthValidation.max) {
    this._api.emit(Events.INTERNAL_ERROR, `[WARNING]: Message Helper - Maximum chunk size is  ${lengthValidation.min}`);
    _options.chunkSize = lengthValidation.max;
  }

  return _options;
};

const getFormattingData = async (api, ads, links) => {
  const data = {
    formatting: {
      groupLinks: await ads.reduce(async (result, ad) => {
        if ((await result).length >= 25) {
          return result;
        }

        (await result).push(
          {
            start: ad.index,
            end: ad.index + ad[1].length,
            groupId: (await api.group().getByName(ad[2]))?.id
          }
        );

        return result;
      }, []),

      links: links.map((link) =>
        (
          {
            start: link.start,
            end: link.end,
            url: link.link
          }
        )
      )
    }
  };

  if (!data.formatting.groupLinks.length) {
    Reflect.deleteProperty(data.formatting, 'groupLinks');
  }

  if (!data.formatting.links.length) {
    Reflect.deleteProperty(data.formatting, 'links');
  }

  return Object.values(data.formatting).length ? data : undefined;
};

const getEmbedData = async (api, formatting, options) => {
  if (!formatting || !options.formatting.includeEmbeds) {
    return undefined;
  }

  const { groupLinks, links } = formatting?.formatting;

  for (const item of [...groupLinks ?? [], ...links ?? []].flat().filter(Boolean)) {
    if (Reflect.has(item, 'groupId')) {
      if (item.groupId === undefined) {
        continue;
      }

      return [{
        type: EmbedType.GROUP_PREVIEW,
        groupId: item.groupId
      }];
    }

    if (Reflect.has(item, 'url')) {
      if (item.url.startsWith('wolf://')) {
        continue;
      }

      const response = await api.getLinkMetadata(item.url);

      if (!response.success) {
        continue;
      }

      const metadata = response.body;

      const preview = {
        type: !metadata.title && metadata.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
        url: api._botConfig.get('validation.link.protocols').some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
      };

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.title) {
        preview.title = metadata?.title ?? '-';

        preview.body = metadata?.description ?? '-';
      }

      return [preview];
    }
  }
};

const buildMessages = async (api, recipient, isGroup, content, options) => {
  content = (options.formatting.success ? `(Y) ${content}` : options.formatting.failed ? `(N) ${content}` : content).toString();
  content = (options.formatting.alert ? `/alert ${content}` : options.formatting.me ? `/me ${content}` : content).toString();

  let offset = 0;

  let developerInjectedLinks = [...content.matchAll(/\[(.+?)\]\((.+?)\)/gu)]?.reduce((results, link) => {
    content = content.replace(link[0], link[1]);

    results.push(
      {
        start: link.index - offset,
        end: (link.index + link[1].length) - offset,
        link: link[2]
      }
    );

    offset += (link[0].length - link[1].length);

    return results;
  }, []);

  const messages = [];
  let embedsAttached = false;

  while (true) { // While loop... probably not the best approach ¯\_(ツ)_/¯
    const messageChunk = content.substr(0, developerInjectedLinks.find((link) => link.start < 1000 && link.end > 1000)?.start || api.utility().string().getAds(content)?.find((ad) => ad.start < 1000 && ad.end > 1000)?.start || api.utility().string().getLinks(content)?.find((link) => link.start < 1000 && link.end > 1000)?.start || (() => {
      if (content.length < 1000) {
        return content.length;
      }

      // Ensure splitting is done at a space and not mid word
      const index = content.lastIndexOf(' ', 1000);

      return index === -1 ? 1000 : index;
    })()).trim();

    // Get formatting data for the chunk
    const formatting = await getFormattingData(api, api.utility().string().getAds(messageChunk), [...developerInjectedLinks.filter((link) => link.end <= messageChunk.length), ...api.utility().string().getLinks(messageChunk)]);

    const embeds = embedsAttached ? undefined : await getEmbedData(api, formatting, options);

    messages.push(
      {
        recipient,
        isGroup,
        mimeType: 'text/plain',
        data: Buffer.from(messageChunk, 'utf8'),
        flightId: uuidv4(),
        metadata: formatting,
        embeds
      }
    );

    if (messageChunk.length === content.length) {
      break;
    }

    embedsAttached = embedsAttached || (embeds?.length ?? false);

    content = (options.formatting.alert ? `/alert ${content.slice(messageChunk.length)}` : options.formatting.me ? `/me ${content.slice(messageChunk.length)}` : content.slice(messageChunk.length)).trim();

    developerInjectedLinks = developerInjectedLinks.filter((developerInjectedLinks) => developerInjectedLinks.start >= messageChunk.length).map((link) =>
      (
        {
          ...link,
          start: (link.start - messageChunk.length - 1) + (options.formatting.alert ? 8 : options.formatting.me ? 5 : 0),
          end: (link.end - messageChunk.length - 1) + (options.formatting.alert ? 8 : options.formatting.me ? 5 : 0)
        }
      )
    );
  }

  return messages;
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
      } else if (!validator.isType(timestamp, 'number')) {
        throw new Error('timestamp must be type of number');
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

  async _sendMessageV2 (targetType, targetId, content, opts = {}) {
    opts = validateV2Options(opts);

    if (opts.links && opts.links.some((link) => link.start > content.length || link.end > content.length)) {
      throw new models.WOLFAPIError('deeplinks start index and end index must be less than or equal to the contents length', { faults: opts.links.filter((link) => link.start > content.length || link.end > content.length) });
    }

    const messages = await buildMessages(this._api, targetId, targetType === MessageTypes.GROUP, content, opts);

    const responses = [];

    for (const message of messages) {
      responses.push(await this._websocket.emit(Commands.MESSAGE_SEND, message));
    }

    return responses.length > 1
      ? new ResponseObject(
        {
          code: 207,
          body: responses
        }
      )
      : responses[0];
  }

  async _sendMessageV1 (targetType, targetId, content, opts = {}) {
    const mimeType = Buffer.isBuffer(content) ? (await fileType.fromBuffer(content)).mime : 'text/plain';

    if (this._api._botConfig.get('multimedia.messaging.validation.mimes').includes(mimeType)) {
      return await this._api.multiMediaService().sendMessage(targetType, targetId, content, mimeType);
    }

    if (!this._api._botConfig.get('validation.messaging.mimes').includes(mimeType)) {
      throw new Error(`${mimeType} is not a supported mimetype`);
    }

    if (!Reflect.has(opts, 'links') && !Reflect.has(opts, 'chunk')) {
      return await this._sendMessageV2(targetType, targetId, content, opts);
    }

    const _opts = getDefaultOptions(this._api, opts);

    const messageLength = this._api._botConfig.get('validation.messaging.length');

    if (!_opts.chunk && content.length > messageLength.max) {
      throw new Error(`Maximum allowed message length with chunking disabled is 1,000, provided message is ${this._api.utility().number().addCommas(content.length)}`);
    }

    if (_opts.links && _opts.links.some((link) => link.start > content.length || link.end > content.length)) {
      throw new Error('deeplinks start index and end index must be less than or equal to the contents length');
    }
    const supportedLinkProtocols = this._api._botConfig.get('validation.link.protocols');

    const chunkedMessage = this._api.utility().string().chunk(content.split(' ').filter(Boolean).join(' '), (_opts.chunk ? _opts.chunkSize : content.length) - (!_opts.formatting.alert && !_opts.formatting.me ? 0 : _opts.formatting.alert ? 6 : 3), ' ', ' ');

    const messagesToSend = (await chunkedMessage.reduce(async (result, chunk, index) => {
      const body = {
        recipient: targetId,
        isGroup: targetType === MessageTypes.GROUP,
        mimeType,
        data: Buffer.from(!_opts.formatting.alert && !_opts.formatting.me ? chunk : _opts.formatting.alert ? `/alert ${chunk}` : `/me ${chunk}`, 'utf8'),
        flightId: uuidv4(),
        metadata: undefined,
        embeds: undefined
      };

      const chunkStartIndex = chunkedMessage.slice(0, index).join(' ').length + index;
      const chunkEndIndex = chunkStartIndex + chunkedMessage[index].length;

      const adsInChunk = this._api.utility().string().getAds(chunk);

      const linksInChunk = chunk.split(' ').reduce((result, value, index) => {
        if (validator.isValidUrl(this._api, value)) {
          const linkStartLocation = chunk.indexOf(value, index);
          const linkEndLocation = linkStartLocation + value.length;
          if (!adsInChunk.some((ad) => inRange(ad.index, ad.index + ad[0].length, linkStartLocation) && inRange(ad.index, ad.index + ad[0].length, linkEndLocation))) {
            const url = this._api.utility().string().getValidUrl(value);
            url.startsAt = linkStartLocation;
            url.endsAt = linkEndLocation;
            result.push(url);
          }
        }

        return result;
      }, []);

      if (_opts.links) {
        const deepLinksInChunk = _opts.links.filter((link) => link.start >= chunkStartIndex && link.start <= chunkEndIndex);

        for (const deepLink of deepLinksInChunk) {
          const offset = !_opts.formatting.alert && !_opts.formatting.me ? 0 : _opts.formatting.alert ? 7 : 4;

          if (deepLink.end > chunkEndIndex) {
            const clonedLink = Object.assign({}, deepLink);

            deepLink.end = chunkEndIndex;

            clonedLink.start = (chunkEndIndex + 1) + offset;
            // clonedLink.end = clonedLink.start + deepLink.end - deepLink.start;

            _opts.links.push(clonedLink);
          } else {
            deepLink.start += offset + (index > 0 ? index - 1 : 0);
            deepLink.end += offset + (index > 0 ? index - 1 : 0);
          }
        }

        // All links have been fixed, continue

        deepLinksInChunk.forEach((link) => {
          const linkStartLocation = link.start - chunkStartIndex;
          const linkEndLocation = link.end - chunkStartIndex;
          if (adsInChunk.some((ad) => inRange(ad.index, ad.index + ad[0].length, linkStartLocation) && inRange(ad.index, ad.index + ad[0].length, linkEndLocation))) {
            throw new Error('you cannot deeplink an index range containing an ad');
          }

          if (linksInChunk.some((linkObj) => linkObj.startsAt === linkStartLocation && linkObj.endsAt === linkEndLocation)) {
            throw new Error('you cannot deeplink an index range containing an url');
          }
          linksInChunk.push(
            {
              startsAt: linkStartLocation,
              endsAt: linkEndLocation,
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
      }

      if (linksInChunk.length > 0 || adsInChunk.length > 0) {
        body.metadata = {
          formatting: {}
        };

        if (adsInChunk.length > 0) {
          body.metadata.formatting.groupLinks = await adsInChunk.reduce(async (result, value) => {
            if ((await result).length >= 25) {
              return result;
            }
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

        if (linksInChunk.length > 0) {
          body.metadata.formatting.links = linksInChunk.reduce((result, value) => {
            if (result.length >= 25) {
              return result;
            }
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

        if (!result.previewAdded && _opts.includeEmbeds) {
          const data = [];

          if (body.metadata.formatting.groupLinks && body.metadata.formatting.groupLinks.length > 0) {
            data.push(...body.metadata.formatting.groupLinks);
          }

          if (body.metadata.formatting.links && body.metadata.formatting.links.length > 0) {
            data.push(...body.metadata.formatting.links);
          }

          const embed = (await data.filter(Boolean).sort((a, b) => a.start - b.start).reduce(async (result, item) => {
            // Only 1 embed per message, else the server will throw an error.
            if ((await result).embed) {
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
                  url: supportedLinkProtocols.some((proto) => item.url.toLowerCase().startsWith(proto)) ? item.url : `http://${item.url}`
                };

                if (preview.type === EmbedType.LINK_PREVIEW) {
                  if (!metadata.body.title) {
                    return result;
                  }

                  preview.title = metadata.body.title || '-';
                  preview.body = metadata.body.description || '-';
                }

                (await result).embed = preview;
              }
            } else if (Reflect.has(item, 'groupId') && item.groupId !== undefined) {
              (await result).embed =
                {
                  type: EmbedType.GROUP_PREVIEW,
                  groupId: item.groupId
                };
            }

            return result;
          },
          {
            embed: undefined
          })).embed;

          if (embed) {
            body.embeds = [embed];
            result.previewAdded = true;
          }
        }
      }

      (await result).messages.push(body);

      return result;
    },
    {
      previewAdded: false,
      messages: []
    })).messages;

    const responses = await messagesToSend.reduce(async (result, body) => {
      if (!body.embeds) {
        Reflect.deleteProperty(body, 'embeds');
      }

      if (!body.metadata) {
        Reflect.deleteProperty(body, 'metadata');
      }

      (await result).push(await this._websocket.emit(Commands.MESSAGE_SEND, body));

      return result;
    }, []);

    return responses.length > 1
      ? new ResponseObject({
        code: 207,
        body: responses
      })
      : responses[0];
  }

  async sendGroupMessage (targetGroupId, content, opts = {}) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessageV1(MessageTypes.GROUP, targetGroupId, content, opts);
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
      } else if (!validator.isType(targetSubscriberId, 'number')) {
        throw new Error('targetSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(content)) {
        throw new Error('content cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(content)) {
        throw new Error('content cannot be null or empty');
      }

      return await this._sendMessageV1(MessageTypes.PRIVATE, targetSubscriberId, content, opts);
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

      return await this._sendMessageV1(commandOrMessage.isGroup ? MessageTypes.GROUP : MessageTypes.PRIVATE, commandOrMessage.isGroup ? commandOrMessage.targetGroupId : commandOrMessage.sourceSubscriberId, content, opts);
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
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (!validator.isType(timestamp, 'number')) {
        throw new Error('timestamp must be type of number');
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
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (!validator.isType(timestamp, 'number')) {
        throw new Error('timestamp must be type of number');
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
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (!validator.isType(timestamp, 'number')) {
        throw new Error('timestamp must be type of number');
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
}

module.exports = Messaging;
