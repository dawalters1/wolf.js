
import MemberListType from '../constants/MemberListType.js';
import GroupMemberListSection from './GroupMemberListSection.js';

class GroupMemberList {
  constructor (client, targetGroupId) {
    this.client = client;
    this.targetGroupId = targetGroupId;

    // #region GROUP_MEMBER_{NAME}_LIST
    this.privileged = new GroupMemberListSection(this.client, MemberListType.PRIVILEGED);
    this.regular = new GroupMemberListSection(this.client, MemberListType.REGULAR);
    this.banned = new GroupMemberListSection(this.client, MemberListType.BANNED);
    // #endregion

    // #region  GROUP_MEMBER_SEARCH
    this.silenced = new GroupMemberListSection(this.client, MemberListType.SILENCED);
    this.bots = new GroupMemberListSection(this.client, MemberListType.BOTS);
    // #endregion
  }

  get (subscriberId) {
    for (const listName of Object.values(MemberListType)) {
      const member = this[listName]._get(subscriberId);

      if (member) {
        return member;
      }
    }

    return undefined;
  }

  _add (subscriber, capabilities) {
    Object.values(MemberListType).forEach((list) => this[list]._add(subscriber, capabilities));
  }

  _delete (subscriber) {
    Object.values(MemberListType).forEach((list) => this[list]._delete(subscriber));
  }

  _update (subscriber, capabilities) {
    Object.values(MemberListType).forEach((list) => this[list]._update(subscriber, capabilities));
  }
}

export default GroupMemberList;
