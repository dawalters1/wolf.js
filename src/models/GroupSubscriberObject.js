const { AdminAction } = require('../constants');
const patch = require('../utils/Patch');

class GroupSubscriber {
  constructor (api, groupSubscriber, groupId) {
    this._api = api;
    this.groupId = groupId;
    patch(this, groupSubscriber);
  }

  toDisplayName (withId = true, trimAds = false) {
    const nickname = trimAds ? this._api._utility._string.trimAds(this.nickname) : this.nickname;

    return `${nickname}${withId ? ` (${this.id})` : ''}`;
  }

  async sendMessage (content, opts = null) {
    return await this._api._messaging.sendPrivateMessage(this.id, content, opts);
  }

  async add () {
    return await this._api._contact.add(this.id);
  }

  async remove () {
    return await this._api._contact.remove(this.id);
  }

  async block () {
    return await this._api._contact._blocked.block(this.id);
  }

  async unblock () {
    return await this._api._contact._blocked.unblock(this.id);
  }

  async getAvatar (size = 640) {
    return await this._api._utility._subscriber.getAvatar(this.id, size);
  }

  async admin () {
    return await this._api._group.updateSubscriber(this.groupId, this.id, AdminAction.ADMIN);
  }

  async mod () {
    return await this._api._group.updateSubscriber(this.groupId, this.id, AdminAction.MOD);
  }

  async regular () {
    return await this._api._group.updateSubscriber(this.groupId, this.id, AdminAction.REGULAR);
  }

  async silence () {
    return await this._api._group.updateSubscriber(this.groupId, this.id, AdminAction.SILENCE);
  }

  async ban () {
    return await this._api._group.updateSubscriber(this.groupId, this.id, AdminAction.BAN);
  }
}

module.exports = GroupSubscriber;
