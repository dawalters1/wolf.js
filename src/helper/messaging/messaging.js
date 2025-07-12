import _ from 'lodash';
import Ad from '../../entities/ad.js';
import { Command } from '../../constants/Command.js';
import { EmbedType } from '../../constants/EmbedType.js';
import { fileTypeFromBuffer } from 'file-type';
import Link from '../../entities/link.js';
import { MessageType } from '../../constants/index.js';
import { nanoid } from 'nanoid';
import StatusCodes from 'http-status-codes';
import urlRegexSafe from 'url-regex-safe';
import WOLFResponse from '../../entities/WOLFResponse.js';

const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/gui;
const isValidUrl = (url) => urlRegex.test(url);

const getAds = (client, content) =>
  [...content.matchAll(/(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\(.+?\)|\d|\p{Letter}))/gus)].map(ad => new Ad(client, ad));

const getLinks = (client, content) => {
  const urls = content.match(urlRegexSafe({ localhost: true, returnString: false })) || [];

  const sortedUrls = urls.map(url => url.replace(/\.+$/, '')).sort((a, b) => b.length - a.length);

  const matchedIndices = new Set();
  const matches = [];

  for (const url of sortedUrls) {
    const urlPattern = new RegExp(`(?:(?<!\\d|\\p{Letter}))(${_.escapeRegExp(url)})(?:(?!\\d|\\p{Letter}))`, 'gu');

    for (const match of content.matchAll(urlPattern)) {
      if (!matchedIndices.has(match.index) && isValidUrl(match[1])) {
        matchedIndices.add(match.index);
        matches.push(match);
      }
    }
  }

  return matches.map(match => new Link(client, match));
};

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

const buildMessages = async (client, recipient, isChannel, content, opts) => {
  if (opts?.formatting?.success) { content = `(Y) ${content}`; } else if (opts?.formatting?.failed) { content = `(N) ${content}`; }

  if (opts?.formatting?.alert) { content = `/alert ${content}`; } else if (opts?.formatting?.me) { content = `/me ${content}`; }

  content = content.toString().trim();
  let offset = 0;

  let developerInjectedLinks = [...content.matchAll(/\[(.+?)\]\((.+?)\)/gu)].reduce((results, match) => {
    content = content.replace(match[0], match[1]);
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
    const overflowAd = getAds(client, content)?.find(ad => ad.start < 1000 && ad.end > 1000);
    const overflowLink = getLinks(client, content)?.find(link => link.start < 1000 && link.end > 1000);

    const splitIndex = (
      overflowDeveloperLink?.start ??
      overflowAd?.start ??
      overflowLink?.start ??
      (() => {
        if (content.length < 1000) { return content.length; }
        const index = content.lastIndexOf(' ', 1000);
        return index === -1
          ? 1000
          : index;
      })()
    );

    const chunk = content.slice(0, splitIndex).trim();

    const ads = getAds(client, chunk);
    const links = [
      ...developerInjectedLinks.filter(l => l.end <= chunk.length),
      ...getLinks(client, chunk)
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

    if (chunk.length === content.length) { break; }

    embedsAttached ||= !!(embeds?.length);
    content = (opts?.formatting?.alert
      ? '/alert '
      : opts?.formatting?.me
        ? '/me '
        : '') + content.slice(chunk.length).trim();

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

  async _sendMessage (targetId, isChannel, content, opts) {
    const mimeType = Buffer.isBuffer(content)
      ? (await fileTypeFromBuffer(content))?.mime
      : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const messageConfig = this.client.config.framework.mmsEndpoints.message;
      // verification

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
    return this._sendMessage(channelId, true, content, opts);
  }

  async sendPrivateMessage (userId, content, opts) {
    return this._sendMessage(userId, false, content, opts);
  }
}

export default MessagingHelper;
