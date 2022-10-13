import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';
import validateMultimediaConfig from '../../utils/validateMultimediaConfig.js';
import fileType from 'file-type';

class Group extends Base {
  async getEventList (targetGroupId, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!forceNew && group.events.length) {
      return group.events;
    }

    const response = await this.client.websocket.emit(Command.GROUP_EVENT_LIST, {
      id: parseInt(targetGroupId),
      subscribe: true
    });

    if (response.success) {
      group.events = response.body.length ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];
    }

    return group.events;
  }

  async create (targetGroupId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined) {
    // TODO: validate

    const result = await this._websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        groupId: targetGroupId,
        title,
        longDescription,
        shortDescription,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt)
      }
    );

    if (result.success && thumbnail) {
      result.body.thumbnailUploadResponse = await this.updateThumbnail(result.body.id, thumbnail);
    }
  }

  async update (targetGroupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, thumbnail = undefined) {
    // TODO: validate
    const result = await this._websocket.emit(
      Command.GROUP_EVENT_UPDATE,
      {
        groupId: targetGroupId,
        id: eventId,
        title,
        longDescription,
        shortDescription,
        imageUrl,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isRemoved: false
      }
    );

    if (result.success && thumbnail) {
      result.body.thumbnailUploadResponse = await this.updateThumbnail(result.body.id, thumbnail);
    }

    return result;
  }

  async updateThumbnail (eventId, thumbnail) {
    // TODO: validate
    const eventConfig = this.client._botConfig.get('multimedia.event');

    validateMultimediaConfig(eventConfig, thumbnail);

    return this.client.multimedia.upload(eventConfig.route,
      {
        data: thumbnail.toString('base64'),
        mimeType: (await fileType.fromBuffer(thumbnail)).mime,
        id: eventId,
        source: this.client.currentSubscriber.id
      }
    );
  }

  async delete (targetGroupId, eventId) {
    return await this.client.websocket.emit(
      Command.GROUP_EVENT_CREATE,
      {
        groupId: parseInt(targetGroupId),
        id: parseInt(eventId),
        isRemoved: true
      }
    );
  }
}

export default Group;
