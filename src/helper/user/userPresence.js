import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';

class UserPresenceHelper {
  constructor (client) {
    this.client = client;
  }

  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserPresenceHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserPresenceHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserPresenceHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

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
        .isValidArray(`UserPresenceHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('UserPresenceHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }
    const presenceMap = new Map();
    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    const subscribe = opts?.subscribe ?? true;

    if (!opts?.forceNew) {
      const cachedPresence = users.filter(
        (user) => user !== null && (subscribe
          ? user._presence?.subscribed
          : true)
      );
      cachedPresence.forEach((user) => presenceMap.set(user.id, user._presence));
    }

    const idsToFetch = userIds.filter((id) => !presenceMap.has(id));

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

      [...response.body.entries()].filter(([, presenceResponse]) => presenceResponse.success)
        .forEach(([userId, presenceResponse]) => {
          const user = users.find((user) => user?.id === userId);

          if (user && user._presence) {
            user._presence.patch(presenceResponse.body);
            user._presence.subscribed = subscribe;
            presenceMap.set(userId, user._presence);
          }
        });
    }

    return userIds.map((userId) => presenceMap.get(userId) ?? null);
  }
}

export default UserPresenceHelper;
