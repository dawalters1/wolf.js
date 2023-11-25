import Base from '../Base.js';

class Role extends Base {
  async getById (roleId, languageId, forceNew = false) {
    return (await this.client.role.getByIds(roleId, languageId, forceNew))[0];
  }

  async getByIds (roleIds, languageId, forceNew = false) {
    return await this.client.role.getByIds(roleIds, languageId, forceNew);
  }

  /**
   * Request all the available channel roles
   * @param {number} id - The ID of the channel
   * @param {boolean} forceNew - Whether or not to request new data from the server
   * @returns {Promise<Array<models.ChannelRole>>}
   */
  async roles (id, forceNew = false) {
    return this.client.role.channel.list(id, forceNew);
  }

  /**
   * Request all the members assigned Channel Roles
   * @param {number} id
   * @param {boolean} subscribe
   * @param {boolean} forceNew
   * @returns {Promise<Array<models.ChannelRoleMember>>}
   */
  async members (id, subscribe = true, forceNew = false) {
    return this.client.role.channel.members(id, subscribe, forceNew);
  }

  /**
   * Assign a Channel Role
   * @param {number} id
   * @param {number} subscriberId
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async assign (id, subscriberId, roleId) {
    return this.client.role.channel.assign(id, subscriberId, roleId);
  }

  /**
   * Reassign a Channel Role
   * @param {number} id
   * @param {number} oldSubscriberId
   * @param {number} newSubscriberId
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async reassign (id, oldSubscriberId, newSubscriberId, roleId) {
    return this.client.role.channel.reassign(id, oldSubscriberId, newSubscriberId, roleId);
  }

  /**
   * Unassign a Channel Role
   * @param {number} id
   * @param {number} subscriberId
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async unassign (id, subscriberId, roleId) {
    return this.client.role.channel.unassign(id, subscriberId, roleId);
  }
}

export default Role;
