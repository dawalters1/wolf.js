const Member = require('./Member');
const validator = require('../../validator');

class Group {
  constructor (api) {
    this._api = api;

    this._member = new Member(this._api);
  }

  /**
   * Exposes the member methods
   * @returns {Member}
   */
  member () {
    return this._member;
  }

  /**
   * Download a groups avatar
   * @param {Number} targetGroupId - The ID of the group
   * @param {Number} size - The size of the image you want to download
   * @returns {Buffer} The buffer of the image
   */
  async getAvatar (targetGroupId, size) {
    return await this._api.utility().download().file(this._api.utility().string().replace(`${this._api.endpointConfig.avatarEndpoint}/FileServerSpring/group/avatar/{targetGroupId}?size={size}`,
      {
        targetGroupId,
        size
      }));
  }

  /**
   * Convert group to a displayable name string {name} ({groupId}) OR {group}
   * @param {Object} subscriber - The subscriber
   * @param {Boolean} excludeId - Whether or not to display the subscribers ID
   * @returns {String} - The display string
   */
  toDisplayName (group, excludeId = false) {
    if (typeof group !== 'object') {
      throw new Error('group must be object');
    }

    if (!Reflect.has(group, 'name')) {
      throw new Error('subscriber must contain nickname');
    }

    if (!Reflect.has(group, 'id')) {
      throw new Error('group must contain id');
    }

    if (!validator.isValidBoolean(excludeId)) {
      throw new Error('excludeId must be a valid boolean');
    }

    return `${group.name}${excludeId ? '' : ` (${group.id})`}`;
  }
}

module.exports = Group;
