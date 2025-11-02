import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { validate } from '../../validator/index.js';
import WOLFStar from '../../entities/wolfstar.js';

class WOLFStarHelper extends BaseHelper {
  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`WOLFStarHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`WOLFStarHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `WOLFStarHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'WOLFStarHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`WOLFStarHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('WOLFStarHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('WOLFStarHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'WOLFStarHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'WOLFStarHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} Not Found`);
    }

    const idsToFetch = opts?.forceNew
      ? userIds
      : userIds.filter((userId) => {
        const user = users.find((user) => user.id === userId);
        return user !== null && !user.wolfstarStore?.fetched;
      });

    if (idsToFetch.length) {
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

      for (const [userId, wolfstarResponse] of response.body.entries()) {
        if (!wolfstarResponse.success) {
          continue;
        }

        const user = users.find((user) => user?.id === userId);

        user.wolfstarStore.value = user.wolfstarStore.value?.patch(wolfstarResponse.body) ?? new WOLFStar(this.client, wolfstarResponse.body);
      }
    }

    return userIds.map((userId) => users.find((user) => user.id === userId).wolfstarStore.value ?? null);
  }
}

export default WOLFStarHelper;
