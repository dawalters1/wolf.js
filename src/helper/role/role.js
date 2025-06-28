import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { Role } from '../../entities/role.js';

class RoleHelper extends BaseHelper {
  async getById (roleId, langaugeId, opts) {
    return (await this.getByIds([roleId], langaugeId, opts))[0];
  }

  async getByIds (roleIds, languageId, opts) {
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
