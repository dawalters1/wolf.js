const { capability } = require('../constants');
const patch = require('../utils/Patch');

class GroupSubscriber {
  constructor (api, groupSubscriber) {
    this._api = api;
    patch(this, groupSubscriber);
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

  async admin () {
    return await this._api.group().updateSubscriber(this.groupId, this.id, capability.ADMIN);
  }

  async mod () {
    return await this._api.group().updateSubscriber(this.groupId, this.id, capability.MOD);
  }

  async regular () {
    return await this._api.group().updateSubscriber(this.groupId, this.id, capability.REGULAR);
  }

  async silence () {
    return await this._api.group().updateSubscriber(this.groupId, this.id, capability.SILENCED);
  }

  async ban () {
    return await this._api.group().updateSubscriber(this.groupId, this.id, capability.BANNED);
  }
}

module.exports = GroupSubscriber;
