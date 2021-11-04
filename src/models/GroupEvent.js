const patch = require('../utils/patch');

class GroupEvent {
  constructor (api, event) {
    this._api = api;

    patch(this, event);
  }

  async update (targetGroupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, thumbnail = undefined) {
    return await this._api.event().updateEvent(
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
    return await this._api.event().updateEventThumbnail(this.eventId, thumbnail);
  }

  async delete () {
    return await this._api.event().deleteEvent(this.eventId);
  }

  async subscribe () {
    return await this._api.event().subscribeToEvent(this.eventId);
  }

  async unsubscribe () {
    return await this._api.event().unsubscribeFromEvent(this.eventId);
  }
}

module.exports = GroupEvent;
