const Member = require('./Member');
const validator = require('../../validator');

class Group {
  constructor (api) {
    this._api = api;

    this._member = new Member(this._api);
  }

  member () {
    return this._member;
  }

  async getAvatar (targetGroupId, size) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(size)) {
        throw new Error('size cannot be null or undefined');
      } else if (!validator.isValidNumber(size)) {
        throw new Error('size must be a valid number');
      } else if (validator.isLessThanOrEqualZero(size)) {
        throw new Error('size cannot be less than or equal to 0');
      }

      return await this._api.utility().download().file(
        this._api.utility().string().replace(`${this._api.endpointConfig.avatarEndpoint}/FileServerSpring/group/avatar/{targetGroupId}?size={size}`,
          {
            targetGroupId,
            size
          }
        )
      );
    } catch (error) {
      error.internalErrorMessage = `api.utility().group().getAvatar(targetGroupId=${JSON.stringify(targetGroupId)}, size=${JSON.stringify(size)})`;
      throw error;
    }
  }

  toDisplayName (group, excludeId = false) {
    try {
      if (typeof group !== 'object') {
        throw new Error('group must be object');
      }

      if (!Reflect.has(group, 'name')) {
        throw new Error('group must contain name');
      } else if (validator.isNullOrUndefined(group.name)) {
        throw new Error('name cannot be null or undefined');
      }

      if (!Reflect.has(group, 'id')) {
        throw new Error('group must contain id');
      } else if (validator.isNullOrUndefined(group.id)) {
        throw new Error('id cannot be null or undefined');
      } else if (!validator.isValidNumber(group.id)) {
        throw new Error('id must be a valid number');
      } else if (!validator.isType(group.id, 'number')) {
        throw new Error('id must be type of number');
      } else if (validator.isLessThanOrEqualZero(group.id)) {
        throw new Error('id cannot be less than or equal to 0');
      }

      if (!validator.isValidBoolean(excludeId)) {
        throw new Error('excludeId must be a valid boolean');
      }

      return `${group.name}${excludeId ? '' : ` (${group.id})`}`;
    } catch (error) {
      Reflect.deleteProperty(group, '_api');
      error.internalErrorMessage = `api.utility().group().toDisplayName(group=${JSON.stringify(group)}, excludeId=${JSON.stringify(excludeId)})`;
      throw error;
    }
  }
}

module.exports = Group;
