const { Capability } = require('../constants');
const GroupSubscriber = require('../models/GroupSubscriber');

/**
 * Initial test setup
 */
class GroupSubscriberManager {
  constructor (api, group) {
    this.api = api;
    this.group = group;

    this.owner = undefined;
    this.admins = [];
    this.mods = [];
    this.regular = [];
    this.silenced = [];
    this.banned = [];
  }

  get _all () {
    return [this.owner, ...this.admins, ...this.mods, ...this.regular, ...this.silenced, ...this.banned];
  }

  async isInGroup (subscriberId) {
    return this._all.some((subscriber) => subscriber.id === subscriberId);
  }

  async get (subscriberId) {
    const requested = this._all.find((member) => member.id === subscriberId);

    if (requested) {
      return requested;
    }

    const result = await this.api.websocket.emit('group member',
      {
        groupId: this.group.id,
        subscriberId
      }
    );

    if (result.success) {
      const subscriber = await this.api.subscriber.getById(subscriberId);

      const member = new GroupSubscriber(
        this.api,
        {
          ...result.body,
          subscriber,
          groupId: this.group.id
        }
      );

      switch (result.body.capabilities) {
        case Capability.OWNER:
          this.owner = member;
          break;
        case Capability.ADMIN:
          this.admins.push(member);
          break;
        case Capability.MOD:
          this.mods.push(member);
          break;
        case Capability.REGULAR:
          this.regular.push(member);
          break;
        case Capability.SILENCED:
          this.silenced.push(member);
          break;
        default:
          this.banned.push(member);
          break;
      }

      return member;
    }

    return null;
  }

  async getOwner () {
    return this.owner ?? await this.getSubscriber(this.group.owner.id);
  }

  async getPrivileged () {
    // TODO:
  }

  async getAdmins () {
    // TODO:
  }

  async getMods () {
    // TODO:
  }

  async getRegular () {
    // TODO:
  }

  async getSilenced () {
    // TODO:
  }

  async getBanned () {
    // TODO:
  }
}

module.exports = GroupSubscriberManager;
