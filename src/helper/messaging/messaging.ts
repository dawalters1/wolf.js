import _ from 'lodash';
import Ad from '../../structures/ad';
import { Command } from '../../constants/Command';
import { EmbedType } from '../../constants/EmbedType';
import { fileTypeFromBuffer } from 'file-type';
import Link from '../../structures/link';
import { MessageType } from '../../constants';
import { nanoid } from 'nanoid';
import StatusCodes from 'http-status-codes';
import urlRegexSafe from 'url-regex-safe';
import { validateUrl } from '@the-node-forge/url-validator';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';

type MessageSendOptions = {
  formatting: {
    includeEmbeds: boolean
    success: boolean
    failed: boolean
    alert: boolean
    me: boolean
  }
}

const getAds = (client: WOLF, content: String): Ad[] => [...content.matchAll(/(?:(?<!\d|\p{Letter}))(\[(.+?)\])(?:(?!\(.+?\)|\d|\p{Letter}))/gus)].map((ad) => new Ad(client, ad));
const getLinks = (client: WOLF, content: string): Link[] => {
  const urls = content.match(urlRegexSafe({ localhost: true, returnString: false })) || [];

  const sortedUrls = urls.map(url => url.replace(/\.+$/, ''))
    .sort((a, b) => b.length - a.length);

  const matchedIndices = new Set<number>();
  const matches: RegExpMatchArray[] = [];

  for (const url of sortedUrls) {
    const urlPattern = new RegExp(
      `(?:(?<!\\d|\\p{Letter}))(${_.escapeRegExp(url)})(?:(?!\\d|\\p{Letter}))`,
      'gu'
    );

    for (const match of content.matchAll(urlPattern)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!matchedIndices.has(match.index!) && validateUrl(match[0])) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        matchedIndices.add(match.index!);
        matches.push(match);
      }
    }
  }

  return matches.map((match) => new Link(client, match));
};

const getFormattingData = async (client: WOLF, ads: Ad[], links: Link[]): Promise<any> => {
  const data = {
    formatting: {
      groupLinks: await Promise.all(
        ads.slice(0, 25)
          .map(async (ad:any) =>
            (
              {
                start: ad.start,
                end: ad.end,
                groupId: (await ad.channel())?.id
              }
            )
          )
      ),
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

  if ('groupLinks' in data.formatting || 'links' in data.formatting) {
    return data;
  }

  return undefined;
};

const getEmbedData = async (client: WOLF, data?: any, opts?: MessageSendOptions): Promise<any[] | undefined> => {
  const includeEmbeds = opts?.formatting?.includeEmbeds ?? true;

  if (!includeEmbeds) {
    return undefined;
  }

  const sortedData = [...data?.formatting?.groupLinks ?? [], ...data?.formatting?.links ?? []]
    .flat()
    .sort((a, b) => a.start - b.start);

  for (const item of sortedData) {
    if ('groupId' in item) {
      if (item.groupId === undefined) { continue; }

      return [
        {
          type: EmbedType.CHANNEL_PREVIEW,
          groupId: item.groupId
        }
      ];
    }

    if ('url' in item) {
      if (item.url.startsWith('wolf://')) { continue; }

      const metadata = await client.metadata.metadata(item.url);

      if (metadata === null) { continue; }

      const preview = {
        type: !metadata.title && metadata.imageSize ? EmbedType.IMAGE_PREVIEW : EmbedType.LINK_PREVIEW,
        url: ((item.url.indexOf('://') === -1) && (item.url.indexOf('mailto:') === -1)) ? 'http://' + item.url : item.url
      } as any;

      if (preview.type === EmbedType.LINK_PREVIEW && metadata.title) {
        preview.title = metadata?.title ?? undefined;

        preview.body = metadata?.description ?? undefined;
      }

      return [preview];
    }
  }

  return undefined;
};

const buildMessages = async (client: WOLF, recipient: number, isChannel: boolean, content: string, opts?: MessageSendOptions) => {
  // Prefix content with success/failure/alert/me flags
  if (opts?.formatting?.success) { content = `(Y) ${content}`; } else if (opts?.formatting?.failed) { content = `(N) ${content}`; }

  if (opts?.formatting?.alert) { content = `/alert ${content}`; } else if (opts?.formatting?.me) { content = `/me ${content}`; }

  content = content.toString().trim();
  let offset = 0;

  // Extract markdown-style links [text](url)
  let developerInjectedLinks = [...content.matchAll(/\[(.+?)\]\((.+?)\)/gu)]
    .reduce((results, match) => {
      content = content.replace(match[0], match[1]);

      results.push({
        start: match.index - offset,
        end: match.index + match[1].length - offset,
        link: match[2]
      });

      offset += match[0].length - match[1].length;
      return results;
    }, [] as any[]);

  const messages = [];
  let embedsAttached = false;

  while (true) {
    const overflowDeveloperLink = developerInjectedLinks.find((link) => link.start < 1000 && link.end > 1000);
    const overflowAd = getAds(client, content)?.find((ad) => ad.start < 1000 && ad.end > 1000);
    const overflowLink = getLinks(client, content)?.find((link) => link.start < 1000 && link.end > 1000);

    const splitIndex = (
      overflowDeveloperLink?.start ??
      overflowAd?.start ??
      overflowLink?.start ??
      (() => {
        if (content.length < 1000) { return content.length; };
        const index = content.lastIndexOf(' ', 1000);
        return index === -1 ? 1000 : index;
      })()
    );

    const chunk = content.slice(0, splitIndex).trim();

    const ads = getAds(client, chunk);
    const links = [
      ...developerInjectedLinks.filter(l => l.end <= chunk.length),
      ...getLinks(client, chunk)
    ];

    const formattingData = await getFormattingData(client, ads, links);
    const embeds: any | undefined = embedsAttached ? undefined : await getEmbedData(client, formattingData, opts);

    messages.push({
      recipient,
      isGroup: isChannel,
      mimeType: 'text/plain',
      data: Buffer.from(chunk, 'utf8'),
      flightId: nanoid(32),
      metadata: formattingData,
      embeds
    });

    if (chunk.length === content.length) { break; };

    embedsAttached ||= !!(embeds?.length);
    content = (opts?.formatting?.alert ? '/alert ' : opts?.formatting?.me ? '/me ' : '') + content.slice(chunk.length).trim();

    developerInjectedLinks = developerInjectedLinks
      .filter(l => l.start >= chunk.length)
      .map(link => {
        const adjustment = opts?.formatting?.alert ? 8 : opts?.formatting?.me ? 5 : 0;
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
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async _subscribeToChannel (channelId?: number | number[]) {
    const requestBody: any = {
      headers: {
        version: 4
      }
    };

    if (channelId) {
      requestBody.body = {
        idList: Array.isArray(channelId) ? channelId : [channelId]
      };
    }

    return await this.client.websocket.emit(
      Command.MESSAGE_GROUP_SUBSCRIBE,
      requestBody
    );
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

  async _sendMessage (targetId: number, isChannel: boolean, content: string | Buffer, opts?: MessageSendOptions): Promise<WOLFResponse<any> | WOLFResponse<WOLFResponse<any>[]>> {
    const mimeType = Buffer.isBuffer(content) ? (await fileTypeFromBuffer(content))?.mime : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      throw new Error('NOT IMPLEMENTED');
    }

    const messages = await buildMessages(this.client, targetId, isChannel, content as string, opts);

    const responses = [];

    for (const message of messages) {
      responses.push(await this.client.websocket.emit<any>(Command.MESSAGE_SEND, message));
    }

    return responses.length > 1
      ? new WOLFResponse<WOLFResponse<any>[]>(
        {
          code: StatusCodes.MULTI_STATUS,
          body: responses
        }
      )
      : responses[0];
  }

  async sendChannelMessage (channelId: number, content: string | Buffer, opts?: MessageSendOptions) {
    return this._sendMessage(channelId, true, content, opts);
  }

  async sendPrivateMessage (userId: number, content: string | Buffer, opts?: MessageSendOptions) {
    return this._sendMessage(userId, false, content, opts);
  }
}

export default MessagingHelper;
