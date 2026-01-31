import BaseUtility from './BaseUtility.js';
import UserPrivilege from '../constants/UserPrivilege.js';
import { validate } from '../validation/Validation.js';

export default class UserUtility extends BaseUtility {
  constructor (client) {
    super(client);

    this.privilege = {
      has: async (...args) => this.#has(args[0], args[1], args[2])
    };
  }

  async #has (userId, privileges, requireAll = false) {
    const normalisedUserId = this.normaliseNumber(userId);
    const normalisedPrivileges = this.normaliseArray(privileges);

    validate(normalisedUserId, this, this.privilege.has)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedPrivileges, this, this.privilege.has)
      .isArray()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .in(Object.values(UserPrivilege));

    const user = await this.client.user.fetch(userId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} NOT FOUND`); }

    return normalisedPrivileges[requireAll
      ? 'every'
      : 'some']((privilege) => user.privilegeList.includes(privilege));
  }
}
