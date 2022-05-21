// TODO: VALIDATION

const WOLFAPIError = require('../WOLFAPIError');
const imageSize = require('image-size');
const fileType = require('file-type');
const { Command } = require('../../constants');

class Event {
  constructor (data = undefined) {
    this.id = data?.id ?? undefined;
    this.groupId = data?.groupId ?? undefined;
    this.title = data?.title;
    this.startsAt = data?.startsAt ?? undefined;
    this.endsAt = data?.endsAt ?? undefined;
    this.shortDescription = data?.shortDescription ?? undefined;
    this.longDescription = data?.longDescription ?? undefined;
    this.thumbnail = undefined;
    this.imageUrl = data?.imageUrl ?? undefined;
  }

  setTitle (name) {
    this.title = name;

    return this;
  }

  setStartTime (date) {
    this.startsAt = date;

    return this;
  }

  setEndTime (date) {
    this.endsAt = date;

    return this;
  }

  setShortDescription (shortDescription) {
    this.shortDescription = shortDescription;

    return this;
  }

  setLongDescription (longDescription) {
    this.longDescription = longDescription;

    return this;
  }

  setThumbnail (thumbnail) {
    this.thumbnail = thumbnail;

    return this;
  }

  async save () {
    const response = await this.client.emit(
      this.isNew ? Command.GROUP_EVENT_CREATE : Command.GROUP_EVENT_UPDATE,
      {
        id: this.id,
        groupId: this.groupId,
        title: this.title,
        longDescription: this.longDescription,
        shortDescription: this.shortDescription,
        startsAt: new Date(this.startsAt),
        endsAt: new Date(this.endsAt),
        imageUrl: this.imageUrl,
        isRemoved: false
      }
    );

    if (response.success && this.thumbnail) {
      const eventConfig = this.client._botConfig.get('multimedia.event');

      const fileTypeResult = await fileType.fromBuffer(this.thumbnail);

      if (!eventConfig.mimeTypes.includes(fileTypeResult.mime)) {
        throw new WOLFAPIError('mimeType is unsupported', { mime: fileTypeResult.mime });
      }

      if (Buffer.byteLength(this.thumbnail) > eventConfig.sizes[fileTypeResult.ext]) {
        throw new WOLFAPIError('Thumbnail too large', { current: Buffer.byteLength(this.thumbnail), max: eventConfig.sizes[fileTypeResult.ext] });
      }

      const size = imageSize(this.thumbnail);

      if (size.width !== size.height) {
        throw new WOLFAPIError('Thumbnail must be square', { width: size.width, height: size.height });
      }

      response.thumbnailUpload = await this.client.multimedia.upload(eventConfig.route,
        {
          data: this.thumbnail.toString('base64'),
          mimeType: fileTypeResult.mime,
          id: parseInt(this.id),
          source: this.client.currentSubscriber.id
        }
      );
    }

    return response;
  }
}

module.exports = Event;
