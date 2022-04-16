const patch = require('../utils/Patch');

class Group {
  constructor (api, group) {
    this._api = api;
    patch(this, group);

    this.subscribers = this.subscribers || [];
  }

  toDisplayName (withId = true) {
    return `[${this.name}]${withId ? ` (${this.id})` : ''}`;
  }

  async sendMessage (content, opts = null) {
    return await this._api._messaging.sendGroupMessage(this.id, content, opts);
  }

  async update () {
    return await this._api._group.update(this);
  }

  async join (password = undefined) {
    return await this._api._group.joinById(this.id, password);
  }

  async leave () {
    return await this._api._group.leaveById(this.id);
  }

  async getAvatar (size = 640) {
    return await this._api._utility._group.getAvatar(this.id, size);
  }

  async updateAvatar (buffer) {
    return await this._api._group.updateAvatar(this.id, buffer);
  }
}

module.exports = Group;
