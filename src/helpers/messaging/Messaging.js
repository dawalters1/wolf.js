import BaseHelper from '../BaseHelper.js';
import EmbedType from '../../constants/EmbedType.js';
import { fileTypeFromBuffer } from 'file-type';
import Message from '../../entities/Message.js';
import MessageSubscriptionType from '../../constants/MessageSubscriptionType.js';
import MessageType from '../../constants/MessageType.js';
import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validation/Validation.js';
import WOLFResponse from '../../entities/WOLFResponse.js';

const ZERO_WIDTH_LINK_REGEX = /\[([\p{Cf}\s]+)\]\(([^)]+)\)/gu;

export default class MessagingHelper extends BaseHelper {
  async #getFormattingData (ads, links) {
    const data = {
      formatting: {
        groupLinks: await Promise.all(
          ads.slice(0, 25).map(async ad => ({
            start: ad.start,
            end: ad.end,
            groupId: (await ad.fetch())?.id
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

  async #getEmbedData (data, opts) {
    const includeEmbeds = opts?.formatting?.includeEmbeds ?? false;
    if (!includeEmbeds) { return undefined; }

    const sortedData = [...(data?.formatting?.groupLinks ?? []), ...(data?.formatting?.links ?? [])]
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
        const linkPreviewData = item.preview();

        if (linkPreviewData === null) { continue; }

        return [linkPreviewData];
      }
    }

    return undefined;
  }

  async #buildMessages (id, content, isChannel, opts = {}) {
    let body = content;

    if (opts?.formatting?.success) { body = `(Y) ${body}`; } else if (opts?.formatting?.failed) { body = `(N) ${body}`; }

    if (opts?.formatting?.alert) { body = `/alert ${body}`; } else if (opts?.formatting?.me) { body = `/me ${body}`; }

    body = body.trim();

    // If inside the brackets is a zero width or unicode space, this breaks, jank fix is to replace with Braille pattern blank
    body = [...body.matchAll(ZERO_WIDTH_LINK_REGEX)]
      .reverse()
      .reduce((result, match) => result.replace(match[0], `[${'\u2800'}](${match[2]})`), body);

    let offset = 0;
    let developerInjectedLinks = [...body.matchAll(/\[(.+?)\]\((.+?)\)/gu)]
      .reduce((result, match) => {
        body = body.replace(match[0], match[1]);

        result.push({
          start: match.index - offset,
          end: match.index + match[1].length - offset,
          link: match[2]
        });

        offset += match[0].length - match[1].length;
        return result;
      }, []);

    const messages = [];
    let embedsAttached = false;

    while (true) {
      const overflowDeveloperLink = developerInjectedLinks.find(
        (link) => link.start < 1000 && link.end > 1000
      );

      const overflowAd = this.client.utility.string
        .getAds(body)
        ?.find((ad) => ad.start < 1000 && ad.end > 1000);

      const overflowLink = this.client.utility.string
        .getLinks(body)
        ?.find((link) => link.start < 1000 && link.end > 1000);

      const splitIndex = overflowDeveloperLink?.start ??
        overflowAd?.start ??
        overflowLink?.start ??
        (body.length <= 1000
          ? body.length
          : (() => {
              const lastSpace = body.lastIndexOf(' ', 1000);
              return lastSpace === -1
                ? 1000
                : lastSpace;
            })()
        );

      const chunk = body.slice(0, splitIndex).trim();

      const ads = this.client.utility.string.getAds(chunk);

      const links = [
        ...developerInjectedLinks.filter((link) => link.end <= chunk.length),
        ...this.client.utility.string.getLinks(chunk)
      ];

      const formattingData = await this.#getFormattingData(ads, links.flat());
      const embeds = embedsAttached
        ? undefined
        : await this.#getEmbedData(formattingData, opts);

      messages.push({
        recipient: id,
        isGroup: isChannel,
        mimeType: 'text/plain',
        data: Buffer.from(chunk, 'utf8'),
        flightId: nanoid(32),
        metadata: formattingData,
        embeds
      });

      if (chunk.length === body.length) { break; }

      embedsAttached ||= Boolean(embeds?.length);

      const prefix = opts?.formatting?.alert
        ? '/alert '
        : opts?.formatting?.me
          ? '/me '
          : '';

      body = prefix + body.slice(chunk.length).trim();

      const prefixAdjustment = opts?.formatting?.alert
        ? 8
        : opts?.formatting?.me
          ? 5
          : 0;

      developerInjectedLinks = developerInjectedLinks
        .filter((link) => link.start >= chunk.length)
        .map((link) =>
          (
            {
              ...link,
              start: link.start - chunk.length - 1 + prefixAdjustment,
              end: link.end - chunk.length - 1 + prefixAdjustment
            }
          )
        );
    }

    return messages;
  }

  async #sendMessage (id, content, isChannel, opts = {}) {
    const mimeType = Buffer.isBuffer(content)
      ? (await fileTypeFromBuffer(content))?.mime
      : MessageType.TEXT_PLAIN;

    if (mimeType !== MessageType.TEXT_PLAIN) {
      const multimedia = this.client.config.framework.multimedia.messaging;

      if (!multimedia) { throw new Error('Message multimeda not found'); }
      // TODO: some form of validation

      const isAudio = ['audio/x-m4a', 'audio/x-mp4'].includes(mimeType);
      return;
      return this.client.multimedia.post(
        multimedia,
        {
          data: isAudio
            ? content
            : content.toString('base64'),
          mimeType: isAudio
            ? 'audio/aac'
            : mimeType,
          recipient: id,
          isGroup: isChannel,
          flightId: nanoid(32)
        }
      );
    }

    const messages = await this.#buildMessages(id, content, isChannel, opts);

    const responses = [];
    return;
    for (const message of messages) {
      const response = await this.client.websocket.emit(
        'message send',
        message
      );

      responses.push(response);

      // Stop sending on first failure
      if (response?.code !== StatusCodes.OK) { break; }
    }

    return responses.length > 1
      ? new WOLFResponse({
        code: StatusCodes.MULTI_STATUS,
        body: responses
      })
      : responses[0];
  }

  async subscribe (targetIds, targetType) {
    let normalisedIds = this.normaliseNumbers(targetIds);

    // Jank but allows .subscribe('channel/private')
    if (Object.values(MessageSubscriptionType).includes(targetIds)) {
      targetType = targetIds;
      normalisedIds = undefined;
    }

    const isChannel = targetType === MessageSubscriptionType.CHANNEL;

    const request = {
      headers: {
        version: isChannel
          ? 4
          : 2
      },
      ...(isChannel && normalisedIds?.length && { body: { idList: normalisedIds } })
    };

    return await this.client.websocket.emit(
      isChannel
        ? 'message group subscribe'
        : 'message private subscribe',
      request
    );
  }

  async sendChannelMessage (id, content, opts) {
    return this.#sendMessage(id, content, true, opts);
  }

  async sendPrivateMessage (id, content, opts) {
    return this.#sendMessage(id, content, false, opts);
  }

  async delete (id, timestamp, isChannel = true) {
    const normalisedId = this.normaliseNumber(id);
    const normalisedTimestamp = this.normaliseNumber(timestamp);

    validate(normalisedId, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedTimestamp, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const response = await this.client.websocket.emit(
      'message update',
      {
        body: {
          isGroup: isChannel,
          metadata: {
            isDeleted: true
          },
          recipientId: normalisedId,
          timestamp: normalisedTimestamp
        }
      }
    );

    response.body = new Message(this.client, response.body);

    return response;
  }

  async restore (id, timestamp, isChannel = true) {
    const normalisedId = this.normaliseNumber(id);
    const normalisedTimestamp = this.normaliseNumber(timestamp);

    validate(normalisedId, this, this.restore)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedTimestamp, this, this.restore)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const response = await this.client.websocket.emit(
      'message update',
      {
        body: {
          isGroup: isChannel,
          metadata: {
            isDeleted: false
          },
          recipientId: normalisedId,
          timestamp: normalisedTimestamp
        }
      }
    );

    response.body = new Message(this.client, response.body);

    return response;
  }
}
