import BaseHelper from '../BaseHelper.js';
import Notification from '../../entities/Notification.js';
import NotificationGlobal from '../../entities/NotificationGlobal.js';
import { validate } from '../../validation/Validation.js';

export default class NotificationGlobalHelper extends BaseHelper {
  async #fetchList (opts) {
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

    if (!opts?.forceNew && this.client.me.notificationStore.global.fetched) { return this.client.me.notificationStore.global.values(); }

    const batch = async (results = []) => {
      const response = await this.client.websocket.emit(
        'notification global list',
        {
          body: {
            subscribe: opts?.subscribe ?? true,
            offset: results.length,
            limit: 50
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await batch(results);
    };

    this.client.me.notificationStore.global.clear();
    this.client.me.notificationStore.global.fetched = true;

    return (await batch())
      .map((serverNotification) =>
        this.client.me.notificationStore.global.set(
          new Notification(this.client, serverNotification)
        )
      );
  }

  async #fetchByIds (ids, opts) {
    const isArrayResponse = Array.isArray(ids);
    const normalisedNotificationIds = this.normaliseNumbers(ids);

    const idsToFetch = opts?.forceNew
      ? normalisedNotificationIds
      : normalisedNotificationIds.filter((notificationId) =>
        !this.store.has((item) => item.id === notificationId)
      );

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'notification global',
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const id = idsToFetch[index];

        if (!childResponse.success) {
          this.client.me.notificationStore.global.delete((item) => item.id === id);
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.client.me.notificationStore.global.set(
          new NotificationGlobal(this.client, childResponse.body),
          maxAge
        );
      }
    }

    const notifications = normalisedNotificationIds.map((notificationId) =>
      this.store.get(
        (item) => item.id === notificationId
      )
    );

    return isArrayResponse
      ? notifications
      : notifications[0];
  }

  async fetch (notificationIds, opts) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    const normalisedOpts = this.normaliseFetchOpts(notificationIds, opts);

    if (!notificationIds || this.isObject(notificationIds)) {
      return this.#fetchList(normalisedOpts);
    }

    return this.#fetchByIds(notificationIds, opts);
  }
}
