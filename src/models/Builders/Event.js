// TODO: VALIDATION

const { Command } = require('../../constants');

class Event {
  constructor (client, eventData) {
    this.client = client;

    this.targetGroupId = eventData?.targetGroupId ?? 0;
    this.id = eventData?.id ?? undefined;
    this.title = eventData?.title;
    this.startsAt = eventData?.startsAt ?? undefined;
    this.endsAt = eventData?.endsAt ?? undefined;
    this.shortDescription = eventData?.shortDescription ?? undefined;
    this.longDescription = eventData?.longDescription ?? undefined;
    this.thumbnail = undefined;
    this.imageUrl = eventData?.imageUrl ?? undefined;

    this.isRemoved = eventData?.isRemoved ?? false;

    this.isNew = Object.keys(eventData).length > 1;
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

  save () {
    return Promise.resolve((resolve) => {
      const response = this.client.emit(
        this.isNew ? Command.GROUP_EVENT_CREATE : Command.GROUP_EVENT_UPDATE,
        {
          targetGroupId: this.targetGroupId,
          id: this.id,
          title: this.title,
          startsAt: new Date(this.startsAt),
          endsAt: new Date(this.endsAt),
          shortDescription: this.shortDescription,
          longDescription: this.longDescription,
          imageUrl: this.imageUrl,

          isRemoved: this.isRemoved
        }
      );

      if (response.success && this.thumbnail) {
        // TODO: upload thumbnail
      }

      resolve(response);
    });
  }
}

module.exports = Event;
