import Base from '../Base.js';
import Channel from './Channel.js';
import Subscriber from './Subscriber.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import { Language, Command } from '../../constants/index.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

class Role extends Base {
  constructor (client) {
    super(client);

    this._roles = {};

    this.channel = new Channel(this.client);
    this.subscriber = new Subscriber(this.client);
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
      return [];
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

  _cleanUp (reconnection) {
    this._roles = {};
  }
}

export default Role;
