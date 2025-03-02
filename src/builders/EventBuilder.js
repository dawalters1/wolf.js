import verify from 'wolf.js-verify';

class EventBuilder {
  setChannelId (channelId) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(channelId)) {
        throw new Error(`EventBuilder.setChannelId() parameter, channelId: ${JSON.stringify(channelId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(channelId)) {
        throw new Error(`EventBuilder.setChannelId() parameter, channelId: ${JSON.stringify(channelId)}, is zero or negative`);
      }
    }

    this.channelId = channelId;

    return channelId;
  }

  setTitle (title) {
    { // eslint-disable-line no-lone-blocks
      if (verify.isNullOrWhitespace(title)) {
        throw new Error(`EventBuilder.setTitle() parameter, title: ${JSON.stringify(title)}, cannot be null or empty`);
      }
    }

    this.title = title;

    return this;
  }

  setShortDescription (shortDescription) {
    { // eslint-disable-line no-lone-blocks
      if (verify.isNullOrWhitespace(shortDescription)) {
        throw new Error(`EventBuilder.setShortDescription() parameter, shortDescription: ${JSON.stringify(shortDescription)}, cannot be null or empty`);
      }
    }

    this.shortDescription = shortDescription;

    return this;
  }

  setLongDescription (longDescription) {
    { // eslint-disable-line no-lone-blocks
      if (verify.isNullOrWhitespace(longDescription)) {
        throw new Error(`EventBuilder.setLongDescription() parameter, longDescription: ${JSON.stringify(longDescription)}, cannot be null or empty`);
      }
    }

    this.longDescription = longDescription;

    return this;
  }

  setThumbnail (thumbnail) {
    { // eslint-disable-line no-lone-blocks
      if (!Buffer.isBuffer(thumbnail)) {
        throw new Error(`EventBuilder.setThumbnail() parameter, thumbnail: ${JSON.stringify(thumbnail)} must be a buffer`);
      }
    }

    this.thumbnail = thumbnail;

    return this;
  }

  setEventTime (startAt, endAt) {
    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidDate(startAt)) {
        throw new Error(`EventBuilder.setEventTime() parameter, startAt: ${JSON.stringify(startAt)} is not a valid date`);
      } else if (new Date(startAt) < Date.now()) {
        throw new Error(`EventBuilder.setEventTime() parameter, startAt: ${JSON.stringify(startAt)} must be in the future`);
      }

      if (!verify.isValidDate(endAt)) {
        throw new Error('EventBuilder.setEventTime() parameter, endAt is not a valid date');
      } else if (new Date(endAt) < Date.now()) {
        throw new Error('EventBuilder.setEventTime() parameter, endAt must be in the future');
      } else if (new Date(endAt) < new Date(startAt)) {
        throw new Error('EventBuilder.setEventTime() parameter, endAt must be after startAt');
      }
    }

    this.startAt = startAt;
    this.endAt = endAt;

    return this;
  }
}

export default EventBuilder;
