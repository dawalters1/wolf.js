
import BaseHelper from '../BaseHelper.js';
import Notification from '../../entities/Notification.js';
import NotificationUser from '../../entities/NotificationUser.js';

export default class NotificationUserHelper extends BaseHelper {
  async fetch (notificationIds, opts) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    if (!notificationIds || notificationIds instanceof Object) {
      opts = notificationIds;

      if (!opts?.forceNew && this.client.me.notificationStore.user.fetched) { return this.client.me.notificationStore.user.values(); }

      const batch = async (results = []) => {
        const response = await this.client.websocket.emit(
          'notification user list',
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

    const isArrayResponse = Array.isArray(notificationIds);
    const normalisedEventIds = this.normaliseNumbers(notificationIds);

    const idsToFetch = opts?.forceNew
      ? normalisedEventIds
      : normalisedEventIds.filter((eventId) =>
        !this.store.has((item) => item.id === eventId)
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

    const notifications = normalisedEventIds.map((eventId) =>
      this.store.get(
        (item) => item.id === eventId
      )
    );

    return isArrayResponse
      ? notifications
      : notifications[0];
  }
}
