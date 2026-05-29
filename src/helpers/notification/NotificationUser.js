
import BaseHelper from '../BaseHelper.js';
import Notification from '../../entities/Notification.js';
import NotificationUser from '../../entities/NotificationUser.js';
import { validate } from '../../validation/Validation.js';

export default class NotificationUserHelper extends BaseHelper {
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

    if (!opts?.forceNew && this.client.me.notificationStore.user.fetched) { return this.client.me.notificationStore.user.values(); }

    const batch = async (results = []) => {
      const response = await this.client.websocket.emit(
        'notification subscriber list',
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

    this.client.me.notificationStore.user.clear();
    this.client.me.notificationStore.user.fetched = true;

    return (await batch())
      .map((serverNotification) =>
        this.client.me.notificationStore.user.set(
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
        'notification user',
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
          this.client.me.notificationStore.user.delete((item) => item.id === id);
          this.store.delete((item) => item.id === id);
          continue;
        }

        this.client.me.notificationStore.user.set(
          new NotificationUser(this.client, childResponse.body),
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

    const normalised = this.normaliseNumbers(notificationIds);
    const normalisedOpts = this.normaliseFetchOpts(normalised, opts);

    if (!normalised || this.isObject(normalised)) {
      return this.#fetchList(normalisedOpts);
    }

    return this.#fetchByIds(notificationIds, opts);
  }
}
