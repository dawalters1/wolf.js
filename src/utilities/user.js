import BaseUtility from './BaseUtility.js';

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

    // TODO: validation

    const user = await this.client.user.fetch(userId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} NOT FOUND`); }

    return normalisedPrivileges[requireAll
      ? 'every'
      : 'some']((privilege) => user.privilegeList.includes(privilege));
  }
}
