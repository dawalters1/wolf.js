import BaseHelper from '../BaseHelper.js';
import UserPresence from '../../entities/UserPresence.js';
import { validate } from '../../validation/Validation.js';

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
            .isBoolean(),

          subscribe: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const subscribe = opts?.subscribe ?? true;

    const users = await this.client.user.fetch(normalisedUserIds);

    const missingUserIds = normalisedUserIds.filter(
      (userId) => !users.some((user) => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} Not Found`);
    }

    const idsToFetch = opts?.forceNew
      ? normalisedUserIds
      : normalisedUserIds.filter((userId) => {
        const user = users.find((user) => user.id === userId);
        return (subscribe && !user.presenceStore.value.subscribed);
      });

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'subscriber presence',
        {
          headers: {
            version: 1
          },
          body: {
            idList: idsToFetch,
            subscribe
          }
        }
      );

      for (const [id, childResponse] of response.body.entries()) {
        childResponse.subscribed = subscribe;
        const user = users.find((user) => user.id === id);

        user.presenceStore.value = childResponse.success
          ? new UserPresence(this.client, childResponse.body)
          : null;
      }
    }

    return isArrayResponse
      ? users.map((user) => user.presenceStore.value)
      : users[0].presenceStore.value;
  }
}
