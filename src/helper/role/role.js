import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { Role } from '../../entities/role.js';
import { validate } from '../../validator/index.js';

class RoleHelper extends BaseHelper {
  async getById (roleId, languageId, opts) {
    roleId = Number(roleId) || roleId;

    { // eslint-disable-line no-lone-blocks
      validate(roleId)
        .isNotNullOrUndefined(`EventHelper.getById() parameter, roleId: ${roleId} is null or undefined`)
        .isValidNumber(`EventHelper.getById() parameter, roleId: ${roleId} is not a valid number`)
        .isGreaterThanZero(`EventHelper.getById() parameter, roleId: ${roleId} is less than or equal to zero`);

      validate(languageId)
        .isNotNullOrUndefined(`RoleHelper.getById() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `RoleHelper.getById() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'EventHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([roleId], languageId, opts))[0];
  }

  async getByIds (roleIds, languageId, opts) {
    roleIds = roleIds.map((channelId) => Number(channelId) || channelId);

    { // eslint-disable-line no-lone-blocks
      validate(roleIds)
        .isValidArray(`RoleHelper.getByIds() parameter, roleIds: ${roleIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('RoleHelper.getByIds() parameter, roleId[{index}]: {value} is null or undefined')
        .isValidNumber('RoleHelper.getByIds() parameter, roleId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('RoleHelper.getByIds() parameter, roleId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`RoleHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `RoleHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'RoleHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }
    const roleMap = new Map();

    if (!opts?.forceNew) {
      const cachedRoles = this.cache.getAll(roleIds)
        .filter((role) => role !== null && role.hasLanguage(languageId));

      cachedRoles.forEach((role) => roleMap.set(role.id, role));
    }

    const idsToFetch = roleIds.filter((id) => !roleMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.GROUP_ROLE,
        {
          body: {
            idList: idsToFetch,
            languageId
          }
        }
      );

      [...response.body.entries()].filter(([_, res]) => res.success)
        .forEach(([roleId, res]) => {
          const existing = this.cache.get(roleId);

          roleMap.set(
            roleId,
            this.cache.set(existing
              ? existing.patch(res.body)
              : new Role(this.client, res.body)
            )
          );
        });
    }

    return roleIds.map((roleId) => roleMap.get(roleId) ?? null);
  }
}

export default RoleHelper;
