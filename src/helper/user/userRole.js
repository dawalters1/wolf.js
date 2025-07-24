import { Command } from '../../constants/Command.js';
import UserRole from '../../entities/userRole.js';
import { validate } from '../../validator/index.js';

class UserRoleHelper {
  constructor (client) {
    this.client = client;
  }

  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserRoleHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserRoleHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserRoleHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isValidArray(`UserRoleHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }
    const userRoleMap = new Map();

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    if (!opts?.forceNew) {
      const cachedUserRoles = users.filter(user => user !== null && user._roles?.fetched);
      cachedUserRoles.forEach(user => userRoleMap.set(user.id, user._roles.value));
    }

    const idsToFetch = userIds.filter(id => !userRoleMap.has(id));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
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
          const user = users.find(user => user?.id === userId);

          if (user) {
            user._roles.value =
              user._roles.value?.patch(userRoleResponse.body) ??
              new UserRole(this.client, userRoleResponse.body);

            userRoleMap.set(user.id, user._roles.value);
          }
        });
    }

    return userIds.map(userId => userRoleMap.get(userId) ?? null);
  }
}

export default UserRoleHelper;
