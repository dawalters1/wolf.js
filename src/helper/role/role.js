import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import { Role } from '../../entities/role.js';
import { validate } from '../../validator/index.js';

class RoleHelper extends BaseHelper {
  async getById (roleId, languageId, opts) {
    roleId = Number(roleId) || roleId;
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(roleId)
        .isNotNullOrUndefined(`EventHelper.getById() parameter, roleId: ${roleId} is null or undefined`)
        .isValidNumber(`EventHelper.getById() parameter, roleId: ${roleId} is not a valid number`)
        .isGreaterThan(0, `EventHelper.getById() parameter, roleId: ${roleId} is less than or equal to zero`);

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
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(roleIds)
        .isArray(`RoleHelper.getByIds() parameter, roleIds: ${roleIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('RoleHelper.getByIds() parameter, roleId[{index}]: {value} is null or undefined')
        .isValidNumber('RoleHelper.getByIds() parameter, roleId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'RoleHelper.getByIds() parameter, roleId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`RoleHelper.getByIds() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `RoleHelper.getByIds() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'RoleHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }
    const idsToFetch = opts?.forceNew
      ? roleIds
      : roleIds.filter((roleId) =>
        !this.store.has((role) => role.id === roleId && role.languageId === languageId)
      );

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

      for (const [index, roleResponse] of response.body.entries()) {
        const roleId = idsToFetch[index];

        if (!roleResponse.success) {
          this.store.delete((role) => role.id === roleId && role.languageId === languageId);
          continue;
        }

        this.store.set(
          new Role(this.client, roleResponse.body),
          response.headers?.maxAge
        );
      }
    }
    return roleIds.map((roleId) =>
      this.store.get((role) => role.id === roleId && role.languageId === languageId)
    );
  }
}

export default RoleHelper;
