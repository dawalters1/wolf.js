const patch = require('../utils/patch');

class Contact {
  constructor (api, contact) {
    this._api = api;
    patch(this, contact);
  }

  toDisplayName (withId = true, trimAds = false) {
    const nickname = trimAds ? this._api.utility().string().trimAds(this.nickname) : this.nickname;

    return `${nickname}${withId ? ` (${this.id})` : ''}`;
  }

  async sendMessage (content, opts = null) {
    return await this._api.messaging().sendPrivateMessage(this.id, content, opts);
  }

  async add () {
    return await this._api.contact().add(this.id);
  }

  async remove () {
    return await this._api.contact().remove(this.id);
  }

  async block () {
    return await this._api.blocked().block(this.id);
  }

  async unblock () {
    return await this._api.blocked().unblock(this.id);
  }

  async getAvatar (size = 640) {
    return await this._api.utility().subscriber().getAvatar(this.id, size);
  }
}

module.exports = Contact;
