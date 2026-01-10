import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import UserPresence from '../../entities/userPresence.js';
import { validate } from '../../validator/index.js';

class UserPresenceHelper extends BaseHelper {
  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserPresenceHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserPresenceHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `UserPresenceHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserPresenceHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`UserPresenceHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserPresenceHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} Not Found`);
    }

    const subscribe = opts?.subscribe ?? true;

    const idsToFetch = opts?.forceNew
      ? userIds
      : userIds.filter((userId) => {
        const user = users.find((user) => user.id === userId);
        return !user || (subscribe && !user.presenceStore?.subscribed);
      });

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_PRESENCE,
        {
          body: {
            idList: idsToFetch,
            subscribe
          }
        }
      );

      for (const [userId, presenceResponse] of response.body.entries()) {
        if (!presenceResponse.success) {
          continue;
        }

        const user = users.find((user) => user?.id === userId);

        user.presenceStore = user.presenceStore?.patch(response.body, subscribe) ?? new UserPresence(this.client, presenceResponse.body, subscribe);
      }
    }

    return userIds.map((userId) => users.find((user) => user.id === userId).presenceStore ?? null);
  }
}

export default UserPresenceHelper;
