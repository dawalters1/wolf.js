import { StatusCodes } from 'http-status-codes';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validator/index.js';
import WOLFResponse from '../entities/WOLFResponse.js';

class UserUtility {
  constructor (client) {
    this.client = client;

    this.privilege = {
      has: async (...args) => this._has(args[0], args[1], args[2])
    };
  }

  async _has (userId, privileges, requireAll = false) {
    userId = Number(userId) || userId;
    privileges = Array.isArray(privileges)
      ? privileges
      : [privileges];
    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isGreaterThan(0, `UserUtility.privilege.has() parameter userId: ${userId}, must be larger than 0`);

      validate(privileges)
        .isValidArray(`UserUtility.privilege.has() parameter, privileges: ${privileges} is not a valid array`)
        .each()
        .isValidConstant(UserPrivilege, 'UserUtility.privilege.has() parameter, capability[{index}]: {value} is not valid');

      validate(requireAll)
        .isBoolean(`UserUtility.privilege.has() parameter, requireAll: ${requireAll} is not a valid boolean`);
    }

    try {
      const user = await this.client.user.getById(userId);

      if (requireAll) {
        return privileges.every((privilege) => user.privilegeList.includes(privilege));
      }

      return privileges.some((privilege) => user.privilegeList.includes(privilege));
    } catch (error) {
      if (error instanceof WOLFResponse) {
        if (error.code === StatusCodes.NOT_FOUND) { return false; }
      }

      throw error;
    }
  }
}

export default UserUtility;
