import BaseHelper from '../BaseHelper.js';
import { validate } from '../../validation/Validation.js';
import WOLFStar from '../../entities/WOLFStar.js';

export default class WOLFStarHelper extends BaseHelper {
  async fetch (userIds, opts) {
    const isArrayResponse = Array.isArray(userIds);

    const normalisedUserIds = this.normaliseNumbers(userIds);

    validate(normalisedUserIds, this, this.fetch)
      .isArray()
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const users = await this.client.user.fetch(normalisedUserIds);

    const missingUserIds = normalisedUserIds.filter(
      (id) => !users.some((user) => user?.id === id)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} Not Found`);
    }

    const idsToFetch = opts?.forceNew
      ? normalisedUserIds
      : normalisedUserIds.filter((userId) => {
        const user = users.find((user) => user.id === userId);
        return !user.wolfstarStore.fetched;
      });

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'wolfstar profile',
        {
          headers: {
            version: 1
          },
          body: {
            idList: idsToFetch
          }
        }
      );

      for (const [id, childResponse] of response.body.entries()) {
        const user = users.find((user) => user.id === id);

        user.wolfstarStore.value = childResponse.success
          ? new WOLFStar(this.client, childResponse.body)
          : null;
      }
    }
    return isArrayResponse
      ? users.map((user) => user.wolfstarStore.value)
      : users[0].wolfstarStore.value;
  }
}
