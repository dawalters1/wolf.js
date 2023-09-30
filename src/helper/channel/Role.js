import validator from '../../validator/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import { Command, Language } from '../../constants/index.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

class Role extends Base {
  constructor (client) {
    super(client);

    this._roles = {};
  }

  async getById (roleId, languageId, forceNew = false) {
    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(roleId)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    return (await this.getByIds(roleId, languageId, forceNew))[0];
  }

  async getByIds (roleIds, languageId, forceNew = false) {
    roleIds = (Array.isArray(roleIds) ? roleIds : [roleIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    if (!roleIds.length) {
      throw new models.WOLFAPIError('ids cannot be null or empty', { roleIds });
    }

    if ([...new Set(roleIds)].length !== roleIds.length) {
      throw new models.WOLFAPIError('ids cannot contain duplicates', { roleIds });
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    for (const roleId of roleIds) {
      if (validator.isNullOrUndefined(roleId)) {
        throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
      } else if (!validator.isValidNumber(roleId)) {
        throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
      } else if (validator.isLessThanOrEqualZero(roleId)) {
        throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
      }
    }

    const roles = forceNew ? [] : this._roles[languageId]?.filter((role) => roleIds.includes(role.id)) ?? [];

    if (roles.length === roleIds.length) {
      return roles;
    }

    const idLists = _.chunk(roleIds.filter((roleId) => !roles.some((role) => role.id === roleId)), this.client._frameworkConfig.get('batching.length'));

    for (const idList of idLists) {
      const response = await this.client.websocket.emit(
        Command.GROUP_ROLE,
        {
          headers: {
            version: 1
          },
          body: {
            idList,
            languageId: parseInt(languageId)
          }
        }
      );

      if (response.success) {
        roles.push(...Object.values(response.body)
          .map((channelRoleResponse) => new models.Response(channelRoleResponse))
          .map((channelRoleResponse, index) =>
            channelRoleResponse.success
              ? this._process(new models.ChannelRoleContext(this.client, channelRoleResponse.body), languageId)
              : new models.ChannelRoleContext(this.client, { id: idList[index] })
          )
        );
      } else {
        roles.push(...idList.map((id) => new models.ChannelRoleContext(this.client, { id })));
      }
    }

    return roles;
  }

  /**
   * Request all the available channel roles
   * @param {number} id - The ID of the channel
   * @param {boolean} forceNew - Whether or not to request new data from the server
   * @returns {Promise<Array<models.ChannelRole>>}
   */
  async roles (id, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    if (!forceNew && channel.roles._requestedRoles) {
      return channel.roles._roles;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUMMARY,
      {
        groupId: parseInt(id)
      }
    );

    channel.roles._requestedRoles = true;
    channel.roles._roles = response?.body?.map((role) => new models.ChannelRole(this.client, role, channel.id)) ?? [];

    return channel.roles._roles;
  }

  /**
   * Request all the members assigned Channel Roles
   * @param {number} id
   * @param {boolean} subscribe
   * @param {boolean} forceNew
   * @returns {Promise<Array<models.ChannelRoleMember>>}
   */
  async members (id, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    if (!forceNew && channel.roles._requestedMembers) {
      return channel.roles._members;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_LIST,
      {
        groupId: parseInt(id),
        subscribe
      }
    );

    channel.roles._requestedMembers = true;
    channel.roles._members = response?.body?.map((roleMember) => new models.ChannelRoleMember(this.client, roleMember, channel.id)) ?? [];

    return channel.roles._members;
  }

  /**
   * Assign a Channel Role
   * @param {number} id
   * @param {number} subscriberId
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async assign (id, subscriberId, roleId) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(roleId)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (roles.some((role) => role.subscriberIdList.includes(parseInt(subscriberId)))) {
      throw new models.WOLFAPIError('Subscriber can only hold one seat at a time', { id, subscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(subscriberId)
      }
    );
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
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId cannot be null or undefined', { oldSubscriberId });
    } else if (!validator.isValidNumber(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId must be a valid number', { oldSubscriberId });
    } else if (validator.isLessThanOrEqualZero(oldSubscriberId)) {
      throw new models.WOLFAPIError('oldSubscriberId cannot be less than or equal to 0', { oldSubscriberId });
    }

    if (validator.isNullOrUndefined(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId cannot be null or undefined', { newSubscriberId });
    } else if (!validator.isValidNumber(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId must be a valid number', { newSubscriberId });
    } else if (validator.isLessThanOrEqualZero(newSubscriberId)) {
      throw new models.WOLFAPIError('newSubscriberId cannot be less than or equal to 0', { newSubscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(roleId)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (!roles.some((role) => role.roleId === parseInt(roleId) && role.subscriberIdList.includes(parseInt(oldSubscriberId)))) {
      throw new models.WOLFAPIError('Subscriber does not hold a seat', { id, roleId, oldSubscriberId });
    }

    if (roles.some((role) => role.subscriberIdList.includes(parseInt(newSubscriberId)))) {
      throw new models.WOLFAPIError('Subscriber can only hold one seat at a time', { id, newSubscriberId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_ASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(oldSubscriberId),
        replaceSubscriberId: parseInt(newSubscriberId)
      }
    );
  }

  /**
   * Unassign a Channel Role
   * @param {number} id
   * @param {number} subscriberId
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async unassign (id, subscriberId, roleId) {
    if (validator.isNullOrUndefined(id)) {
      throw new models.WOLFAPIError('id cannot be null or undefined', { id });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('id must be a valid number', { id });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
    }

    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }

    if (validator.isNullOrUndefined(roleId)) {
      throw new models.WOLFAPIError('roleId cannot be null or undefined', { roleId });
    } else if (!validator.isValidNumber(id)) {
      throw new models.WOLFAPIError('roleId must be a valid number', { roleId });
    } else if (validator.isLessThanOrEqualZero(id)) {
      throw new models.WOLFAPIError('roleId cannot be less than or equal to 0', { roleId });
    }

    const channel = await this.client.channel.getById(id);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Unknown channel', { id });
    }

    const roles = await this.roles(id);

    if (!roles.some((role) => role.roleId === parseInt(roleId))) {
      throw new models.WOLFAPIError('Unknown channel role', { id, roleId });
    }

    if (!roles.some((role) => role.roleId === parseInt(roleId) && role.subscriberIdList.includes(parseInt(subscriberId)))) {
      throw new models.WOLFAPIError('Subscriber does not hold seat', { id, subscriberId, roleId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_ROLE_SUBSCRIBER_UNASSIGN,
      {
        groupId: parseInt(id),
        roleId: parseInt(roleId),
        subscriberId: parseInt(subscriberId)
      }
    );
  }

  _process (value, language) {
    if (!this._roles[language]) {
      this._roles[language] = [];
    }

    (Array.isArray(value) ? value : [value]).forEach((role) => {
      const existing = this._roles[language].find((cached) => role.id === cached.id);

      existing ? patch(existing, value) : this._roles[language].push(value);
    });

    return value;
  }

  _cleanUp (reconnection = false) {
    this._roles = {};
  }
}

export default Role;
