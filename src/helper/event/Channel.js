import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import { fileTypeFromBuffer } from 'file-type';

class Channel extends Base {
  async getList (targetGroupId, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { targetGroupId });
    }

    if (!forceNew && channel.events?.length) {
      return channel.events;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe
      }
    );

    if (response.success) {
      channel.events = response.body?.length ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];
    }

    return channel.events;
  }

  async create (targetGroupId, { title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined }) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        groupId: parseInt(targetGroupId),
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

  async update (targetGroupId, eventId, { title, startsAt, endsAt, shortDescription, longDescription, thumbnail }) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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

    if (startsAt) {
      if (!validator.isValidDate(startsAt)) {
        throw new models.WOLFAPIError('startsAt is not a valid date', { startsAt });
      } else if (new Date(startsAt) < Date.now()) {
        throw new models.WOLFAPIError('startsAt must be in the future', { startsAt });
      }
    }

    if (endsAt) {
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
        groupId: parseInt(targetGroupId),
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

    return this.client.multimedia.upload(eventConfig,
      {
        data: thumbnail.toString('base64'),
        mimeType: (await fileTypeFromBuffer(thumbnail)).mime,
        id: parseInt(eventId),
        source: this.client.currentSubscriber.id
      }
    );
  }

  async delete (targetGroupId, eventId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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
        groupId: parseInt(targetGroupId),
        id: parseInt(eventId),
        isRemoved: true
      }
    );
  }
}

export default Channel;
