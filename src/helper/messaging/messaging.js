import { Command } from '../../constants/Command.js';
import { EmbedType } from '../../constants/EmbedType.js';
import { fileTypeFromBuffer } from 'file-type';
import Message from '../../entities/message.js';
import { MessageType } from '../../constants/index.js';
import { nanoid } from 'nanoid';
import StatusCodes from 'http-status-codes';
import { validate } from '../../validator/index.js';
import WOLFResponse from '../../entities/WOLFResponse.js';

const getFormattingData = async (client, ads, links) => {
  const data = {
    formatting: {
      groupLinks: await Promise.all(
        ads.slice(0, 25).map(async ad => ({
          start: ad.start,
          end: ad.end,
          groupId: (await ad.channel())?.id
        }))
      ),
      links: links.map(link => ({
        start: link.start,
        end: link.end,
        url: link.link
      }))
    }
  };

  if (!data.formatting.groupLinks.length) { Reflect.deleteProperty(data.formatting, 'groupLinks'); }
  if (!data.formatting.links.length) { Reflect.deleteProperty(data.formatting, 'links'); }

  return 'groupLinks' in data.formatting || 'links' in data.formatting
    ? data
    : undefined;
};

const getEmbedData = async (client, data, opts) => {
  const includeEmbeds = opts?.formatting?.includeEmbeds ?? true;
  if (!includeEmbeds) { return undefined; }

  const sortedData = [...(data?.formatting?.groupLinks ?? []), ...(data?.formatting?.links ?? [])]
    .flat()
    .sort((a, b) => a.start - b.start);

  for (const item of sortedData) {
    if ('groupId' in item) {
      if (item.groupId === undefined) { continue; }
      return [{ type: EmbedType.CHANNEL_PREVIEW, groupId: item.groupId }];
    }

    if ('url' in item) {
      if (item.url.startsWith('wolf://')) { continue; }

      const metadata = await client.metadata.metadata(item.url);
      if (metadata === null) { continue; }

      const preview = {
        type: !metadata.title && metadata.imageSize
          ? EmbedType.IMAGE_PREVIEW
          : EmbedType.LINK_PREVIEW,
        url: item.url.includes('://') || item.url.startsWith('mailto:')
          ? item.url
          : 'http://' + item.url
      };

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.title) {
        preview.title = metadata.title;
        preview.body = metadata.description;
      }

      return [preview];
    }
  }

  return undefined;
};

const buildMessages = async (client, recipient, isChannel, body, opts) => {
  if (opts?.formatting?.success) { body = `(Y) ${body}`; } else if (opts?.formatting?.failed) { body = `(N) ${body}`; }

  if (opts?.formatting?.alert) { body = `/alert ${body}`; } else if (opts?.formatting?.me) { body = `/me ${body}`; }

  body = body.toString().trim();
  let offset = 0;

  let developerInjectedLinks = [...body.matchAll(/\[(.+?)\]\((.+?)\)/gu)].reduce((results, match) => {
    body = body.replace(match[0], match[1]);
    results.push({
      start: match.index - offset,
      end: match.index + match[1].length - offset,
      link: match[2]
    });
    offset += match[0].length - match[1].length;
    return results;
  }, []);

  const messages = [];
  let embedsAttached = false;

  while (true) {
    const overflowDeveloperLink = developerInjectedLinks.find(link => link.start < 1000 && link.end > 1000);
    const overflowAd = client.utility.string.getAds(body)?.find(ad => ad.start < 1000 && ad.end > 1000);
    const overflowLink = client.utility.string.getLinks(body)?.find(link => link.start < 1000 && link.end > 1000);

    const splitIndex = (
      overflowDeveloperLink?.start ??
      overflowAd?.start ??
      overflowLink?.start ??
      (() => {
        if (body.length < 1000) { return body.length; }
        const index = body.lastIndexOf(' ', 1000);
        return index === -1
          ? 1000
          : index;
      })()
    );

    const chunk = body.slice(0, splitIndex).trim();

    const ads = client.utility.string.getAds(chunk);
    const links = [
      ...developerInjectedLinks.filter(l => l.end <= chunk.length),
      ...client.utility.string.getLinks(chunk)
    ];

    const formattingData = await getFormattingData(client, ads, links);
    const embeds = embedsAttached
      ? undefined
      : await getEmbedData(client, formattingData, opts);

    messages.push({
      recipient,
      isGroup: isChannel,
      mimeType: 'text/plain',
      data: Buffer.from(chunk, 'utf8'),
      flightId: nanoid(32),
      metadata: formattingData,
      embeds
    });

    if (chunk.length === body.length) { break; }

    embedsAttached ||= !!(embeds?.length);
    body = (opts?.formatting?.alert
      ? '/alert '
      : opts?.formatting?.me
        ? '/me '
        : '') + body.slice(chunk.length).trim();

    developerInjectedLinks = developerInjectedLinks
      .filter(l => l.start >= chunk.length)
      .map(link => {
        const adjustment = opts?.formatting?.alert
          ? 8
          : opts?.formatting?.me
            ? 5
            : 0;
        return {
          ...link,
          start: link.start - chunk.length - 1 + adjustment,
          end: link.end - chunk.length - 1 + adjustment
        };
      });
  }

  return messages;
};

class MessagingHelper {
  constructor (client) {
    this.client = client;
  }

  async _subscribeToChannel (channelId) {
    const requestBody = {
      headers: {
        version: 4
      }
    };

    if (channelId) {
      requestBody.body = {
        idList: Array.isArray(channelId)
          ? channelId
          : [channelId]
      };
    }

    return await this.client.websocket.emit(Command.MESSAGE_GROUP_SUBSCRIBE, requestBody);
  }

  async _subscribeToPrivate () {
    return await this.client.websocket.emit(
      Command.MESSAGE_PRIVATE_SUBSCRIBE,
      {
        headers: {
          version: 2
        }
      }
    );
  }

  async #_sendMessage (targetId, isChannel, content, opts) {
    const mimeType = Buffer.isBuffer(content)
      ? (await fileTypeFromBuffer(content))?.mime
      : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const messageConfig = this.client.config.framework.mmsEndpoints.message;

      await this.client.utility._validateBuffer(messageConfig, content, mimeType);

      return this.client.multimedia.post(
        messageConfig,
        {
          data: ['audio/x-m4a', 'audio/x-mp4'].includes(mimeType)
            ? content
            : content.toString('base64'),
          mimeType: ['audio/x-m4a', 'audio/x-mp4'].includes(mimeType)
            ? 'audio/aac'
            : mimeType,
          recipient: parseInt(targetId),
          isGroup: isChannel,
          flightId: nanoid(32)
        }
      );
    }

    const messages = await buildMessages(this.client, targetId, isChannel, content, opts);

    const responses = [];

    for (const message of messages) {
      responses.push(await this.client.websocket.emit(Command.MESSAGE_SEND, message));
    }

    return responses.length > 1
      ? new WOLFResponse({
        code: StatusCodes.MULTI_STATUS,
        body: responses
      })
      : responses[0];
  }

  async sendChannelMessage (channelId, content, opts) {
    return this.#_sendMessage(channelId, true, content, opts);
  }

  async sendPrivateMessage (userId, content, opts) {
    return this.#_sendMessage(userId, false, content, opts);
  }

  async deleteMessage (targetId, timestamp, isChannel = true) {
    targetId = Number(targetId) || targetId;
    timestamp = Number(timestamp) || timestamp;

    { // eslint-disable-line no-lone-blocks
      validate(targetId)
        .isNotNullOrUndefined(`MessagingHelper.deleteMessage() parameter, targetId: ${targetId} is null or undefined`)
        .isValidNumber(`MessagingHelper.deleteMessage() parameter, targetId: ${targetId} is not a valid number`)
        .isGreaterThan(0, `MessagingHelper.deleteMessage() parameter, targetId: ${targetId} is less than or equal to zero`);

      validate(timestamp)
        .isNotNullOrUndefined(`MessagingHelper.deleteMessage() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`MessagingHelper.deleteMessage() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThan(0, `MessagingHelper.deleteMessage() parameter, timestamp: ${timestamp} is less than or equal to zero`);

      validate(isChannel)
        .isBoolean(`MessagingHelper.deleteMessage() parameter, isChannel: ${isChannel} is not a boolean`);
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        body: {
          isGroup: isChannel,
          metadata: {
            isDeleted: true
          },
          recipientId: targetId,
          timestamp
        }
      }
    );

    response.body = new Message(this.client, response.body);

    return response;
  }

  async restoreMessage (targetId, timestamp, isChannel = true) {
    targetId = Number(targetId) || targetId;
    timestamp = Number(timestamp) || timestamp;

    { // eslint-disable-line no-lone-blocks
      validate(targetId)
        .isNotNullOrUndefined(`MessagingHelper.restoreMessage() parameter, targetId: ${targetId} is null or undefined`)
        .isValidNumber(`MessagingHelper.restoreMessage() parameter, targetId: ${targetId} is not a valid number`)
        .isGreaterThan(0, `MessagingHelper.restoreMessage() parameter, targetId: ${targetId} is less than or equal to zero`);

      validate(timestamp)
        .isNotNullOrUndefined(`MessagingHelper.restoreMessage() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`MessagingHelper.restoreMessage() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThan(0, `MessagingHelper.restoreMessage() parameter, timestamp: ${timestamp} is less than or equal to zero`);

      validate(isChannel)
        .isBoolean(`MessagingHelper.restoreMessage() parameter, isChannel: ${isChannel} is not a boolean`);
    }

    const response = await this.client.websocket.emit(
      Command.MESSAGE_UPDATE,
      {
        body: {
          isGroup: isChannel,
          metadata: {
            isDeleted: false
          },
          recipientId: targetId,
          timestamp
        }
      }
    );

    response.body = new Message(this.client, response.body);

    return response;
  }
}

export default MessagingHelper;
