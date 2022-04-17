const Base = require('./Base');

class Event extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);
  }

  async subscribe () {
    return await this.api.event.subscribe(this.id);
  }

  async unsubscribe () {
    return await this.api.event.unsubscribe(this.id);
  }

  async getThumbnail () {
    if (!this.imageUrl) {
      throw new Error('event does not have a thumbnail');
    }

    return await this.api.utility.download(this.imageUrl);
  }

  // TODO: More methods
}

module.exports = Event;
