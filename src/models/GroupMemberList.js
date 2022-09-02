import Capability from '../constants/Capability.js';
import { GroupMemberListSection } from './GroupMemberListSection.js';

class GroupMemberList {
  constructor () {
    this.privileged = new GroupMemberListSection();
    this.regular = new GroupMemberListSection();
    this.silenced = new GroupMemberListSection();
    this.banned = new GroupMemberListSection();
    this.bots = new GroupMemberListSection();

    this.misc = [];
  }

  _get (subscriberId, excludeMisc = false) {
    const lists = [this.privileged.list, this.regular.list, this.silenced.list, this.banned.list, this.bots.list];

    if (!excludeMisc) {
      lists.push(this.misc);
    }

    return lists.flat().find((member) => member.id === subscriberId);
  }

  _remove (subscriberId, fromAll = false) {
    const member = this._get(subscriberId);

    // console.log('found member', member);

    if (member) {
      console.log(member.capabilities);

      if ([Capability.OWNER, Capability.ADMIN, Capability.MOD].includes(member.capabilities)) {
        console.log('removing from privileged');
        this.privileged._remove(member.id);
      } else if (member.capabilities === Capability.REGULAR) {
        console.log('removing from regular');
        this.regular._remove(member.id);
      } else if (member.capabilities === Capability.SILENCED) {
        console.log('removing from silenced');
        this.silenced._remove(member.id);
      } else if (member.capabilities === Capability.BANNED) {
        console.log('removing from banned');
        this.banned._remove(member.id);
      } else {
        console.error('unknown capabilities', member.capabilities);
      }

      if (fromAll) {
        this.bots._remove(member.id);

        member.capabilies = Capability.NOT_MEMBER;

        this.misc.push(member);
      }
    } else {
      console.log('error', subscriberId, 'not found');
    }
  }
}

export { GroupMemberList };
