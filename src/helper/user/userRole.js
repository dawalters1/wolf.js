import BaseHelper from '../baseHelper.js';
import BaseStore from '../../caching/BaseStore.js';
import { Command } from '../../constants/Command.js';
import { StatusCodes } from 'http-status-codes';
import UserRole from '../../entities/userRole.js';
import { validate } from '../../validator/index.js';

class UserRoleHelper extends BaseHelper {
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

    const user = await this.client.user.getById(userId);

    if (!opts?.forceNew && user.roleStore.fetched) {
      return user.roleStore.values();
    }

    try {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_ROLE_SUMMARY,
        {
          headers: {
            version: 2
          },
          body: {
            subscriberId: userId
          }
        }
      );

      response.body.map((serverUserRole) =>
        user.roleStore.set(
          new UserRole(this.client, serverUserRole),
          response.headers?.maxAge
        )
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) {
        throw error;
      }
    }

    user.roleStore.fetched = true;
    return user.roleStore.values();
  }
}

export default UserRoleHelper;
