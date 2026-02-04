import BaseHelper from '../BaseHelper.js';
import ChannelEvent from '../../entities/ChannelEvent.js';
import { fileTypeFromBuffer } from 'file-type';
import { validate, validateConfig } from '../../validation/Validation.js';

const pick = (value, fallback = null) =>
  value !== undefined
    ? value
    : fallback;

const pickNumber = (value, fallback) =>
  value !== undefined
    ? Number(value)
    : fallback;

export default class EventChannelHelper extends BaseHelper {
  async fetch (channelId, opts) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),

          subscribe: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const channel = await this.client.channel.fetch(normalisedChannelId);

    if (channel === null) { throw new Error(`Channel with ID ${normalisedChannelId} NOT FOUND`); }

    if (!opts?.forceNew && channel.eventStore.fetched) { return this.channel.eventStore.values(); }

    const batch = async (results = []) => {
      const response = await this.client.websocket.emit(
        'group event list',
        {
          body: {
            id: normalisedChannelId,
            subscribe: opts?.subscribe ?? true,
            limit: 50,
            offset: results.length
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await batch(results);
    };

    channel.eventStore.clear();
    channel.eventStore.fetched = true;

    return (await batch()).map((serverGroupEvent) =>
      channel.eventStore.set(new ChannelEvent(this.client, serverGroupEvent))
    );
  }

  async create (channelId, event, thumbnail) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(event, this, this.update)
      .isNotRequired()
      .forEachProperty(
        {
          title: validator => validator
            .isString()
            .isNotWhitespace(),
          shortDescription: validator => validator
            .isString()
            .isNotWhitespace(),
          longDescription: validator => validator
            .isNotRequired()
            .isString()
            .isNotWhitespace(),
          startsAt: validator => validator
            .isNotNullOrUndefined()
            .isValidDate()
            .isDateInFuture(),
          endsAt: validator => validator
            .isNotNullOrUndefined()
            .isValidDate()
            .isDateAfter(event.startsAt),
          hostedBy: validator => validator
            .isNotNullOrUndefined()
            .isValidNumber()
            .isNumberGreaterThanZero()
        }
      );

    validate(thumbnail, this, this.update)
      .isNotRequired()
      .isBuffer();

    const thumbnailConfig = this.client.config.framework.multimedia.event;

    if (thumbnail) {
      await validateConfig(thumbnail, thumbnailConfig, null, this, this.create);
    }

    const response = await this.client.websocket.emit(
      'group event create',
      {
        groupId: normalisedChannelId,
        title: event.title,
        longDescription: event.longDescription,
        shortDescription: event.shortDescription,
        startsAt: new Date(event.startsAt),
        endsAt: new Date(event.endsAt),
        hostedBy: event.hostedBy
      }
    );

    if (response.success && thumbnail) {
      response.body.thumbnailUpload = this.client.multimedia.request(thumbnailConfig, {
        data: thumbnail.toString('base64'),
        mimeType: (await fileTypeFromBuffer(thumbnail)).mime,
        id: response.body.id,
        source: this.client.me.id
      });
    }

    return response;
  }

  async update (channelId, eventId, event, thumbnail) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedEventId = this.normaliseNumber(eventId);

    validate(normalisedChannelId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedEventId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(event, this, this.update)
      .isNotRequired()
      .forEachProperty(
        {
          title: validator => validator
            .isNotRequired()
            .isString()
            .isNotWhitespace(),
          shortDescription: validator => validator
            .isNotRequired()
            .isString()
            .isNotWhitespace(),
          longDescription: validator => validator
            .isNotRequired()
            .isString()
            .isNotWhitespace(),
          startsAt: validator => validator
            .isNotNullOrUndefined()
            .isValidDate()
            .isDateInFuture(),
          endsAt: validator => validator
            .isNotNullOrUndefined()
            .isValidDate()
            .isDateAfter(event.startsAt),
          hostedBy: validator => validator
            .isNotNullOrUndefined()
            .isValidNumber()
            .isNumberGreaterThanZero()
        }
      );

    validate(thumbnail, this, this.update)
      .isNotRequired()
      .isBuffer();

    if (!event && !thumbnail) { throw new Error('You must provide a event and/or thumbnail you want to update'); }
    const thumbnailConfig = this.client.config.framework.multimedia.event;

    const eventPrior = await this.client.event.fetch(eventId);

    if (thumbnail) {
      await validateConfig(thumbnail, thumbnailConfig, null, this, this.update);
    }

    const uploadThumbnail = async () => {
      return this.client.multimedia.request(thumbnailConfig, {
        data: thumbnail.toString('base64'),
        mimeType: (await fileTypeFromBuffer(thumbnail)).mime,
        id: normalisedEventId,
        source: this.client.me.id
      });
    };

    if (!event) {
      return uploadThumbnail();
    }

    if (eventPrior === null) { throw new Error(`Event with ID ${normalisedChannelId} NOT FOUND`); }

    const response = await this.client.websocket.emit(
      'group event update',
      {
        groupId: normalisedChannelId,
        title: pick(event.title, eventPrior.title),
        longDescription: pick(event.longDescription, eventPrior.longDescription),
        shortDescription: pick(event.shortDescription, eventPrior.shortDescription),
        startsAt: pick(new Date(event.startsAt), eventPrior.startsAt),
        endsAt: pick(new Date(event.endsAt), eventPrior.endsAt),
        hostedBy: pickNumber(event.hostedBy, eventPrior.hostedBy)
      }
    );

    if (response.success && thumbnail) {
      response.body.thumbnailUpload = await uploadThumbnail();
    }

    return response;
  }

  async delete (channelId, eventId) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedEventId = this.normaliseNumber(eventId);

    validate(normalisedChannelId, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedEventId, this, this.delete)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    return await this.client.websocket.emit(
      'group event update',
      {
        groupId: normalisedChannelId,
        id: normalisedEventId,
        isRemoved: true
      }
    );
  }
}
