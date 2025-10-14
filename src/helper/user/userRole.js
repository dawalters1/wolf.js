import { Command } from '../../constants/Command.js';
import UserRole from '../../entities/userRole.js';
import { validate } from '../../validator/index.js';

class UserRoleHelper {
  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserRoleHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserRoleHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `UserRoleHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'UserRoleHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`UserRoleHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'UserRoleHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'UserRoleHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? userIds
      : userIds.filter((id) => !this.store.has((userRole) => userRole.id === id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_ROLE_SUMMARY,
        {
          headers: {
            version: 2
          },
          body: {
            idList: idsToFetch
          }
        }
      );

      for (const [userId, userRoleResponse] of response.body.entries()) {
        if (!userRoleResponse.success) {
          this.store.delete((userRole) => userRole.id === userId);
          continue;
        }

        this.store.set(
          new UserRole(this.client, userRoleResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return userIds.map((userId) =>
      this.store.get((userRole) => userRole.id === userId) ?? null
    );
  }
}

export default UserRoleHelper;
