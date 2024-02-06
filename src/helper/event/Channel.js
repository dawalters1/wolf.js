import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { fileTypeFromBuffer } from 'file-type';
import patch from '../../utils/patch.js';

class Channel extends Base {
  /**
   * Get the channels event list
   * @param {Number} targetChannelId
   * @param {Boolean} subscribe
   * @param {Boolean} forceNew
   * @returns {Promise<Array<Event>>}
   */
  async getList (targetChannelId, limit = 25, offset = 0, subscribe = true, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
      } else if (!validator.isValidNumber(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
      } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
      } else if (!validator.isValidNumber(limit)) {
        throw new models.WOLFAPIError('limit must be a valid number', { limit });
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
      }

      if (validator.isNullOrUndefined(offset)) {
        throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
      } else if (!validator.isValidNumber(offset)) {
        throw new models.WOLFAPIError('offset must be a valid number', { offset });
      } else if (validator.isLessThanZero(offset)) {
        throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
      }

      if (!validator.isValidBoolean(subscribe)) {
        throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    const events = forceNew ? [] : channel.events?.slice(offset, limit); // TODO: this is not ideal, if developer is unaware they will constantly make calls to the server

    if (events.length !== limit) {
      const response = await this.client.websocket.emit(
        Command.GROUP_EVENT_LIST,
        {
          id: parseInt(targetChannelId),
          subscribe,
          offset: parseInt(offset),
          limit: parseInt(limit)
        }
      );

      if (response.success) {
        this.events.push(...this._process(channel, await this.client.event.getByIds(response.body.map((event) => event.id))));
      }
    }

    return events;
  }

  /**
   * Create an event
   * @param {Number} targetChannelId
   * @param {String} title
   * @param {Date} startsAt
   * @param {Date} endsAt
   * @param {String} shortDescription
   * @param {String} longDescription
   * @param {Buffer} thumbnail
   * @returns {Promise<[Response<Event>, Response]>}
   */
  async create (targetChannelId, { title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined }) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
      } else if (!validator.isValidNumber(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
      } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
      }

      if (validator.isNullOrWhitespace(title)) {
        throw new models.WOLFAPIError('title cannot be null or empty', { title });
      }

      if (!validator.isValidDate(startsAt)) {
        throw new models.WOLFAPIError('startsAt is not a valid date', { startsAt });
      } else if (new Date(startsAt) < Date.now()) {
        throw new models.WOLFAPIError('startsAt must be in the future', { startsAt });
      }

      if (!validator.isValidDate(endsAt)) {
        throw new models.WOLFAPIError('endsAt is not a valid date', { endsAt });
      } else if (new Date(endsAt) < Date.now()) {
        throw new models.WOLFAPIError('endsAt must be in the future', { endsAt });
      } else if (new Date(endsAt) < new Date(startsAt)) {
        throw new models.WOLFAPIError('endsAt must be after startsAt', { startsAt, endsAt });
      }
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        groupId: parseInt(targetChannelId),
        title,
        longDescription,
        shortDescription,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt)
      }
    );

    if (response.success && thumbnail) {
      return [response, await this.updateThumbnail(response.body.id, thumbnail)];
    }

    return response;
  }

  /**
   * Update an existing event
   * @param {Number} targetChannelId
   * @param {Number} eventId
   * @param {String} title
   * @param {Date} startsAt
   * @param {Date} endsAt
   * @param {String} shortDescription
   * @param {String} longDescription
   * @param {Buffer} thumbnail
   * @returns {Promise<[Response<Event>, Response]>}
   */
  async update (targetChannelId, eventId, { title, startsAt, endsAt, shortDescription, longDescription, thumbnail }) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
      } else if (!validator.isValidNumber(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
      } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
      }

      if (validator.isNullOrUndefined(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
      } else if (!validator.isValidNumber(eventId)) {
        throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
      }

      const event = await this.client.event.getById(eventId);

      if (!event.exists) {
        throw new models.WOLFAPIError('Unknown Event', { eventId });
      }

      if (title && validator.isNullOrWhitespace(title)) {
        throw new models.WOLFAPIError('title cannot be null or empty', { title });
      }

      if (!validator.isNullOrUndefined(startsAt)) {
        if (!validator.isValidDate(startsAt)) {
          throw new models.WOLFAPIError('startsAt is not a valid date', { startsAt });
        } else if (new Date(startsAt) < Date.now()) {
          throw new models.WOLFAPIError('startsAt must be in the future', { startsAt });
        }
      }

      if (!validator.isNullOrUndefined(endsAt)) {
        if (!validator.isValidDate(endsAt)) {
          throw new models.WOLFAPIError('endsAt is not a valid date', { endsAt });
        } else if (new Date(endsAt) < Date.now()) {
          throw new models.WOLFAPIError('endsAt must be in the future', { endsAt });
        } else if (new Date(endsAt) < new Date(startsAt)) {
          throw new models.WOLFAPIError('endsAt must be after startsAt', { startsAt, endsAt });
        }
      }
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(eventId),
        title: title ?? event.title,
        longDescription: longDescription ?? undefined,
        shortDescription: shortDescription ?? undefined,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        isRemoved: false
      }
    );

    if (response.success && thumbnail) {
      return [response, await this.updateThumbnail(response.body.id, thumbnail)];
    }

    return response;
  }

  /**
   * Update an events thumbnail
   * @param {Number} eventId
   * @param {Buffer} thumbnail
   * @returns {Promise<Response>}
   */
  async updateThumbnail (eventId, thumbnail) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
      } else if (!validator.isValidNumber(eventId)) {
        throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
      }

      if (!Buffer.isBuffer(thumbnail)) {
        throw new models.WOLFAPIError('thumbnail must be a buffer', { thumbnail });
      }
    }

    const eventConfig = this.client._frameworkConfig.get('multimedia.event');

    validateMultimediaConfig(eventConfig, thumbnail);

    return this.client.multimedia.request(
      eventConfig,
      {
        data: thumbnail.toString('base64'),
        mimeType: (await fileTypeFromBuffer(thumbnail)).mime,
        id: parseInt(eventId),
        source: this.client.currentSubscriber.id
      }
    );
  }

  /**
   * Delete an event
   * @param {Number} targetChannelId
   * @param {Number} eventId
   * @returns {Promise<Response>}
   */
  async delete (targetChannelId, eventId) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
      } else if (!validator.isValidNumber(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
      } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
      }

      if (validator.isNullOrUndefined(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be null or undefined', { eventId });
      } else if (!validator.isValidNumber(eventId)) {
        throw new models.WOLFAPIError('eventId must be a valid number', { eventId });
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new models.WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
      }
    }

    return await this.client.websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(eventId),
        isRemoved: true
      }
    );
  }

  _process (channel, events) {
    if (!Reflect.has(channel, 'events')) {
      channel.events = [];
    }

    events.forEach((event) => {
      const existing = channel.events?.find((evt) => evt.id === event.id);

      existing
        ? patch(existing, event)
        : channel.events.push(event);
    });

    return events;
  }
}

export default Channel;
