// TODO: VALIDATION

class Event {
  constructor (data = undefined) {
    this.id = data.id ?? undefined;
    this.title = data.title;
    this.startsAt = data.startsAt ?? undefined;
    this.endsAt = data.endsAt ?? undefined;
    this.shortDescription = data.shortDescription ?? undefined;
    this.longDescription = data.longDescription ?? undefined;
    this.thumbnail = undefined;
    this.imageUrl = data.imageUrl ?? undefined;

    this.isRemoved = data.isRemoved ?? false;
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
}

module.exports = Event;
