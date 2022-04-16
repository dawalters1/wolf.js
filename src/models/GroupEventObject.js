const patch = require('../utils/Patch');

class GroupEvent {
  constructor (api, event) {
    this._api = api;

    patch(this, event);
  }

  async update (targetGroupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, thumbnail = undefined) {
    return await this._api._event.update(
      targetGroupId,
      eventId,
      title,
      startsAt,
      endsAt,
      shortDescription,
      longDescription,
      imageUrl,
      thumbnail
    );
  }

  async updateThumbnail (thumbnail) {
    return await this._api._event.updateThumbnail(this.eventId, thumbnail);
  }

  async remove () {
    return await this._api._event.remove(this.eventId);
  }

  async subscribe () {
    return await this._api._event.subscribe(this.eventId);
  }

  async unsubscribe () {
    return await this._api._event.unsubscribe(this.eventId);
  }
}

module.exports = GroupEvent;
