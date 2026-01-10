import ChannelMemberCapability from '../constants/ChannelMemberCapability.js';
import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validator/index.js';
import WOLFResponse from '../entities/WOLFResponse.js';

class ChannelUtility {
  constructor (client) {
    this.client = client;

    this.member = {
      hasCapability: async (...args) => this._hasCapability(args[0], args[1], args[2], args[3], args[4])
    };
  }

  async _hasCapability (channelId, userId, capability, checkStaff = true, checkAuthorised = true) {

  }
}

export default ChannelUtility;
