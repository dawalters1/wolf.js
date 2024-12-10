
import { Capability, MemberListType, Privilege } from '../constants/index.js';
import ChannelMemberListSection from './ChannelMemberListSection.js';

class ChannelMemberList {
  constructor (client, id) {
    this.client = client;
    this.id = id;

    this._privileged = new ChannelMemberListSection(this.client, this.id, MemberListType.PRIVILEGED, [Capability.OWNER, Capability.COOWNER, Capability.ADMIN, Capability.MOD]);
    this._regular = new ChannelMemberListSection(this.client, this.id, MemberListType.REGULAR, [Capability.REGULAR, Capability.SILENCED]);
    this._silenced = new ChannelMemberListSection(this.client, this.id, MemberListType.SILENCED, [Capability.SILENCED]);
    this._banned = new ChannelMemberListSection(this.client, this.id, MemberListType.BANNED, [Capability.BANNED]);
    this._bots = new ChannelMemberListSection(this.client, this.id, MemberListType.BOTS, [Capability.OWNER, Capability.COOWNER, Capability.ADMIN, Capability.MOD, Capability.REGULAR, Capability.SILENCED], [Privilege.BOT]);

    // Members that are not in privileged, regular or banned list will appear here until they are loaded in either list
    this._misc = new ChannelMemberListSection(this.client, this.id, MemberListType.MISCELLANEOUS);
  }

  async _get (subscriberId) {
    const member = (
      await Promise.all(
        ['_privileged', '_regular', '_banned', '_misc']
          .map(async (section) =>
            await this[section].get(subscriberId))
      )
    ).filter(Boolean)[0];

    return member?.member;
  }

  async _onJoin (subscriber, capabilities) {
    // Attempt to add user to privileged or regular, if failed add to misc
    if (!(await Promise.all([this._privileged.add(subscriber, capabilities), this._regular.add(subscriber, capabilities)])).some((successful) => successful)) {
      await this._misc.add(subscriber, capabilities);
    }

    return await this._bots.add(subscriber, capabilities);
  }

  async _onSubscriberUpdate (subscriber) {
    await Promise.all(
      ['_privileged', '_regular', '_silenced', '_banned', '_bots', '_misc']
        .map(async (section) =>
          this[section].updateSubscriber(subscriber)
        )
    );
  }

  async _onLeave (subscriber) {
    await Promise.all(
      ['_privileged', '_regular', '_silenced', '_banned', '_bots', '_misc']
        .map(async (section) =>
          this[section].remove(subscriber)
        )
    );
  }

  async _onUpdate (subscriber, capabilities) {
    await Promise.all(
      ['_privileged', '_regular', '_silenced', '_banned', '_bots']
        .map(async (section) =>
          this[section].update(subscriber, capabilities)
        )
    );

    const inMainList = (
      await Promise.all(
        ['_privileged', '_regular', '_banned']
          .map(async (section) =>
            this[section].get(subscriber)
          )
      )
    ).filter(Boolean).length > 0;

    const inMisc = !!await this._misc.get(subscriber);

    // Not in main list and in misc add to misc
    if (!inMainList && !inMisc) {
      return await this._misc.add(subscriber, capabilities);
    } else if (inMainList && inMisc) {
      return await this._misc.remove(subscriber);
    } else if (inMisc) {
      return await this._misc.update(subscriber, capabilities);
    }

    return false;
  }
}

export default ChannelMemberList;
