const { Command, Capability } = require('../../constants');
const { WOLFAPIError } = require('../../models');
const models = require('../../models');
const GroupMemberManager = require('../../models/GroupMemberManager');
const Base = require('../Base');

class Member extends Base {
  // TODO: Large group handling, not V1 (current) handling
  /*
    - Get Subscriber
    - Get Privileged (mod, admin, owner),
    - Get Regular (regular, silenced??),
    - Get Banned
  */

  async _getMembersList (targetGroupId, includeBanned = false) {
    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('Group does not exist', { targetGroupId });
    }

    group.members = group.members || new GroupMemberManager(this.client);

    // after - user ID
    // limit - 100 :|
  }

  async getMember (targetGroupId, subscriberId) {

  }

  async getOwner (targetGroupId) {

  }

  async getMemberList (targetGroupId, includeBanned = false) {

  }

  async admin (targetGroupId, subscriberId) {

  }

  async mod (targetGroupId, subscriberId) {

  }

  async reset (targetGroupId, subscriberId) {

  }

  async silence (targetGroupId, subscriberId) {

  }

  async kick (targetGroupId, subscriberId) {

  }

  async ban (targetGroupId, subscriberId) {

  }
}

module.exports = Member;
