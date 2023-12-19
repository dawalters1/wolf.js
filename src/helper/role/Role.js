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

    this._roles = new Map();

    this.channel = new Channel(this.client);
    this.subscriber = new Subscriber(this.client);
  }

  async getById (roleId, languageId, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
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
    }

    return (await this.getByIds(roleId, languageId, forceNew))[0];
  }

  async getByIds (ids, languageId, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!ids.length) {
        throw new models.WOLFAPIError('ids cannot be null or empty', { ids });
      }

      if ([...new Set(ids)].length !== ids.length) {
        throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
      }

      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      for (const id of ids) {
        if (validator.isNullOrUndefined(id)) {
          throw new models.WOLFAPIError('id cannot be null or undefined', { id });
        } else if (!validator.isValidNumber(id)) {
          throw new models.WOLFAPIError('id must be a valid number', { id });
        } else if (validator.isLessThanOrEqualZero(id)) {
          throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
        }
      }
    }

    const roles = forceNew
      ? []
      : (
          () => {
            const roles = this._roles.get(languageId);

            return ids.map((id) => roles.get(id)).filter(Boolean);
          }
        )();

    if (roles.length === ids.length) {
      return roles;
    }

    const idLists = _.chunk(ids.filter((roleId) => !roles.some((role) => role.id === roleId)), this.client._frameworkConfig.get('batching.length'));

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
    (Array.isArray(value) ? value : [value]).forEach((role) => {
      const existing = this._roles.get(language).get(role.id);

      existing
        ? patch(existing, value)
        : this._roles.get(language)
          .set(role.id, role);
    });

    return Array.isArray(value)
      ? value.map((role) => this._roles.get(language).get(role.id))
      : this._roles.get(language).get(value.id);
  }

  _cleanUp (reconnection) {
    this._roles.clear();
  }
}

export default Role;
