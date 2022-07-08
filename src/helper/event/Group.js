const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const { Command } = require('../../constants');

// const models = require('../../models');

const fileType = require('file-type');
const imageSize = require('image-size');

const uploadThumbnail = async (client, eventId, thumbnail) => {
  const eventConfig = client._botConfig.get('multimedia.event');

  const fileTypeResult = await fileType.fromBuffer(thumbnail);

  if (!eventConfig.mimeTypes.includes(fileTypeResult.mime)) {
    throw new WOLFAPIError('mimeType is unsupported', fileTypeResult.mime);
  }

  if (Buffer.byteLength(thumbnail) > eventConfig.sizes[fileTypeResult.ext]) {
    throw new WOLFAPIError('Thumbnail too large', { current: Buffer.byteLength(thumbnail), max: eventConfig.sizes[fileTypeResult.ext] });
  }

  const size = imageSize(thumbnail);

  if (size.width !== size.height) {
    throw new WOLFAPIError('Thumbnail must be square', { width: size.width, height: size.height });
  }

  return await client.multimedia.upload(eventConfig.route,
    {
      data: thumbnail.toString('base64'),
      mimeType: fileTypeResult.mime,
      id: eventId,
      source: client.currentSubscriber.id
    }
  );
};

class Group extends Base {
  async getGroupEvents (targetGroupId, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('Unknown Group', { targetGroupId });
    }

    if (!forceNew && group.events.length) {
      return group.events;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_EVENT_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true
      }
    );

    if (response.success) {
      group.events = response.body.length ? await this.client.event.getByIds(response.body.map((event) => event.id)) : [];
    }

    return group.events;
  }

  async create (targetGroupId, event) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(event)) {
      throw new WOLFAPIError('event cannot be null or undefined', { event });
    } else if (!(event instanceof require('../../builders/Event'))) {
      throw new WOLFAPIError('event must be instance of eventBuilder', { event });
    }

    const response = await this.client.websocket.emit(Command.GROUP_EVENT_CREATE, event.toJSON(parseInt(targetGroupId)));

    if (response.success && event.thumbnail) {
      response.thumbnailUpload = await uploadThumbnail(this.client, response.body.id, event.thumbnail);
    }

    return response;
  }

  async update (event) {
    if (validator.isNullOrUndefined(event)) {
      throw new WOLFAPIError('event cannot be null or undefined', { event });
    } else if (!(event instanceof require('../../builders/Event'))) {
      throw new WOLFAPIError('event must be instance of eventBuilder', { event });
    }

    const response = await this.client.websocket.emit(Command.GROUP_EVENT_UPDATE, event.toJSON());

    if (response.success && event.thumbnail) {
      response.thumbnailUpload = await uploadThumbnail(this.client, event.id, event.thumbnail);
    }

    return response;
  }

  async delete (targetGroupId, eventId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(eventId)) {
      throw new WOLFAPIError('eventId cannot be null or undefined', { eventId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('eventId must be a valid number', { eventId });
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new WOLFAPIError('eventId cannot be less than or equal to 0', { eventId });
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

module.exports = Group;
