import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { fileTypeFromBuffer } from 'file-type';
import EventCategory from '../../constants/EventCategory.js';

class Channel extends Base {
  /**
   * Get the channels event list
   * @param {Number} targetChannelId
   * @param {Boolean} subscribe
   * @param {Boolean} forceNew
   * @returns {Promise<Array<Event>>}
   */
  async getList (targetChannelId, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetChannelId });
    }

    if (!forceNew && channel.events?.length) {
      return channel.events;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_LIST,
      {
        id: parseInt(targetChannelId),
        subscribe
      }
    );

    if (response.success) {
      channel.events = response.body?.length ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];
    }

    return channel.events;
  }

  /**
   * Create an event
   * @param {Number} targetChannelId
   * @param {Object} body
   * @param {string} body.title
   * @param {date}  body.startsAt
   * @param {date}  body.endsAt
   * @param {number?} body.hostedBy
   * @param {number?} body.category;
   * @param {string?}  body.shortDescription
   * @param {string?}  body.longDescription
   * @param {Buffer?}  body.thumbnail
   * @returns {Promise<[Response<Event>, Response]>}
   */
  async create (targetChannelId, { title, startsAt, endsAt, category = EventCategory.NONE, hostedBy = null, shortDescription = null, longDescription = null, thumbnail = null }) {
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

    if (!validator.isNullOrUndefined(category)) {
      if (!validator.isValidNumber(category)) {
        throw new models.WOLFAPIError('category must be a valid number', { category });
      } else if (!Object.values(EventCategory).includes(category)) {
        throw new models.WOLFAPIError('category is not valid', { category });
      }
    }

    if (!validator.isNullOrUndefined(hostedBy)) {
      if (!validator.isValidNumber(hostedBy)) {
        throw new models.WOLFAPIError('hostedBy must be a valid number', { hostedBy });
      } else if (validator.isLessThanOrEqualZero(hostedBy)) {
        throw new models.WOLFAPIError('hostedBy cannot be less than or equal to 0', { hostedBy });
      }
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

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        groupId: parseInt(targetChannelId),
        title,
        longDescription,
        shortDescription,
        category,
        hostedBy,
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
   * @param {object} body
   * @param {string?} body.title
   * @param {date?}  body.startsAt
   * @param {date?}  body.endsAt
   * @param {number?} body.hostedBy
   * @param {number?} body.category;
   * @param {string?}  body.shortDescription
   * @param {string?}  body.longDescription
   * @param {Buffer?}  body.thumbnail
   * @returns {Promise<[Response<Event>, Response]>}
   */
  async update (targetChannelId, eventId, { title, startsAt, endsAt, category, hostedBy, shortDescription, longDescription, thumbnail }) {
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

    if (!validator.isUndefined(title) && validator.isNullOrWhitespace(title)) {
      throw new models.WOLFAPIError('title cannot be null or empty', { title });
    }

    if (!validator.isNullOrUndefined(category)) {
      if (!validator.isValidNumber(category)) {
        throw new models.WOLFAPIError('category must be a valid number', { category });
      } else if (!Object.values(EventCategory).includes(category)) {
        throw new models.WOLFAPIError('category is not valid', { category });
      }
    }

    if (!validator.isNullOrUndefined(hostedBy)) {
      if (!validator.isValidNumber(hostedBy)) {
        throw new models.WOLFAPIError('hostedBy must be a valid number', { hostedBy });
      } else if (validator.isLessThanOrEqualZero(hostedBy)) {
        throw new models.WOLFAPIError('hostedBy cannot be less than or equal to 0', { hostedBy });
      }
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

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(eventId),
        title: title ?? event.title,
        category: category === null || category === undefined ? event.category : category,
        hostedBy: hostedBy === null ? null : hostedBy ?? event.hostedBy,
        longDescription: longDescription === null ? null : longDescription ?? event.longDescription,
        shortDescription: shortDescription === null ? null : shortDescription ?? event.shortDescription,
        startsAt: startsAt ? new Date(startsAt) : event.startsAt,
        endsAt: endsAt ? new Date(endsAt) : event.endsAt,
        imageUrl: thumbnail === null ? null : undefined,
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

    return await this.client.websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(eventId),
        isRemoved: true
      }
    );
  }
}

export default Channel;
