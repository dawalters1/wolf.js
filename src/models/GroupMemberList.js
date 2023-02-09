
import { Capability, MemberListType, Privilege } from '../constants/index.js';
import GroupMemberListSection from './GroupMemberListSection.js';

class GroupMemberList {
  constructor (client, id) {
    this.client = client;
    this.id = id;

    this._privileged = new GroupMemberListSection(this.client, this.id, MemberListType.PRIVILEGED, [Capability.OWNER, Capability.ADMIN, Capability.MOD]);
    this._regular = new GroupMemberListSection(this.client, this.id, MemberListType.REGULAR, [Capability.REGULAR, Capability.SILENCED]);
    this._silenced = new GroupMemberListSection(this.client, this.id, MemberListType.SILENCED, [Capability.SILENCED]);
    this._banned = new GroupMemberListSection(this.client, this.id, MemberListType.BANNED, [Capability.BANNED]);
    this._bots = new GroupMemberListSection(this.client, this.id, MemberListType.BOTS, [Capability.OWNER, Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.SILENCED], [Privilege.BOT]);

    // Members that are not in privilged, regular or banned list will appear here until they are loaded in either list
    this._misc = new GroupMemberListSection(this.client, this.id);
  }

  async _get (subscriberId) {
    const member = (await Promise.all([
      this._privileged.get(subscriberId),
      this._regular.get(subscriberId),
      this._banned.get(subscriberId),
      this._misc.get(subscriberId)
    ])).filter(Boolean)[0];

    return member?.member;
  }

  async _onJoin (subscriber, capabilities) {
    // Attempt to add user to privileged or regular, if failed add to misc
    if (!(await Promise.all([this._privileged.add(subscriber, capabilities), this._regular.add(subscriber, capabilities)])).some((successful) => successful)) {
      await this._misc.add(subscriber, capabilities);
    }

    await this._bots.add(subscriber, capabilities);

    return Promise.resolve();
  }

  async _onSubscriberUpdate (subscriber) {
    await Promise.all([
      this._privileged.updateSubscriber(subscriber),
      this._regular.updateSubscriber(subscriber),
      this._silenced.updateSubscriber(subscriber),
      this._banned.updateSubscriber(subscriber),
      this._bots.updateSubscriber(subscriber),
      this._misc.updateSubscriber(subscriber)
    ]);
  }

  async _onLeave (subscriber) {
    return await Promise.all([
      this._privileged.remove(subscriber),
      this._regular.remove(subscriber),
      this._silenced.remove(subscriber),
      this._banned.remove(subscriber),
      this._bots.remove(subscriber),
      this._misc.remove(subscriber)
    ]);
  }

  async _onUpdate (subscriber, capabilities) {
    await Promise.all([
      this._privileged.update(subscriber, capabilities),
      this._regular.update(subscriber, capabilities),
      this._silenced.update(subscriber, capabilities),
      this._banned.update(subscriber, capabilities),
      this._bots.update(subscriber, capabilities)
    ]);

    const inMainList = (await Promise.all(
      [
        this._privileged.get(subscriber),
        this._regular.get(subscriber),
        this._banned.get(subscriber)
      ]
    )).filter(Boolean).length > 0;

    const inMisc = !!await this._misc.get(subscriber);

    // Not in main list and in misc add to misc
    if (!inMainList && !inMisc) {
      return await this._misc.add(subscriber, capabilities);
    } else if (inMainList && inMisc) {
      return await this._misc.remove(subscriber);
    } else if (inMisc) {
      return await this._misc.update(subscriber, capabilities);
    }

    return Promise.resolve();
  }
}

export default GroupMemberList;
