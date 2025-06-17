import { Command } from '../../constants/Command';
import { User } from '../../structures/user';
import UserRole, { ServerUserRole } from '../../structures/userRole';
import { UserRoleOptions } from '../../options/requestOptions';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';

class UserRoleHelper {
  readonly client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number, opts?: UserRoleOptions): Promise<UserRole | null> {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds: number[], opts?: UserRoleOptions): Promise<(UserRole | null)[]> {
    const userRoleMap = new Map<number, UserRole | null>();

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    if (!opts?.forceNew) {
      const cachedUserRoles = users.filter((user): user is User => user !== null && user._roles.fetched);
      cachedUserRoles.forEach(user => userRoleMap.set(user.id, user._roles.value));
    }

    const idsToFetch = userIds.filter(id => !userRoleMap.has(id));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerUserRole>>>(
        Command.WOLFSTAR_PROFILE,
        {
          headers: {
            version: 2
          },
          body: {
            idList: idsToFetch
          }
        }
      );

      [...response.body.entries()]
        .filter(([, userRoleResponse]) => userRoleResponse.success)
        .forEach(([userId, userRoleResponse]) => {
          const user = users.find(user => user?.id === userId) as User;

          user._roles.value =
            user._roles.value?.patch(userRoleResponse.body) ??
            new UserRole(this.client, userRoleResponse.body);

          userRoleMap.set(user.id, user._roles.value);
        });
    }

    return userIds.map(userId => userRoleMap.get(userId) ?? null);
  }
}

export default UserRoleHelper;
