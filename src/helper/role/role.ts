
import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import { Language } from '../../constants/Language.ts';
import { Role, ServerRole } from '../../structures/role.ts';
import { RoleOptions } from '../../options/requestOptions.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class RoleHelper extends BaseHelper<Role> {
  async getById (roleId: number, langaugeId: Language, opts?: RoleOptions): Promise<Role | null> {
    return (await this.getByIds([roleId], langaugeId, opts))[0];
  }

  async getByIds (roleIds: number[], languageId: Language, opts?: RoleOptions): Promise<(Role | null)[]> {
    const roleMap = new Map<number, Role>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedRoles = this.cache.getAll(roleIds)
        .filter((role): role is Role => role !== null && role.hasLanguage(languageId));

      cachedRoles.forEach((role) => roleMap.set(role.id, role));
    }

    const missingIds = roleIds.filter((id) => !roleMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerRole>>>(
        Command.GROUP_ROLE,
        {
          body: {
            idList: missingIds,
            languageId
          }
        }
      );

      [...response.body.entries()].filter(([roleId, roleResponse]) => roleResponse.success)
        .forEach(([roleId, roleResponse]) => {
          const existing = this.cache.get(roleId);

          roleMap.set(
            roleId,
            this.cache.set(existing
              ? existing.patch(roleResponse.body)
              : new Role(this.client, roleResponse.body)
            )
          );
        });
    }

    return roleIds.map((roleId) => roleMap.get(roleId) ?? null);
  }
}

export default RoleHelper;
