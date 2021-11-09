const patch = require('../utils/Patch');

class Group {
  constructor (api, group) {
    this._api = api;
    patch(this, group);
  }

  toDisplayName (withId = true) {
    return `[${this.name}]${withId ? ` (${this.id})` : ''}`;
  }

  async sendMessage (content, opts = null) {
    return await this._api.messaging().sendGroupMessage(this.id, content, opts);
  }

  async update () {
    return await this._api.group().update(this);
  }

  async join (password = undefined) {
    return await this._api.group().joinById(this.id, password);
  }

  async leave () {
    return await this._api.group().leaveById(this.id);
  }

  async getAvatar (size = 640) {
    return await this._api.utility().group().getAvatar(this.id, size);
  }

  async updateAvatar (buffer) {
    return await this._api.group().updateAvatar(this.id, buffer);
  }
}

module.exports = Group;
