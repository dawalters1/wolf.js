import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Notification from '../../entities/notification.js';
import NotificationUser from '../../entities/notificationUser.js';

class NotificationUserHelper extends BaseHelper {
  async list (opts) {
    if (!opts?.forceNew && this.client.me?.notificationsUser?.fetched) {
      return this.client.me.notificationsUser.values();
    }

    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_SUBSCRIBER_LIST,
        {
          subscribe: opts?.subscribe ?? true,
          offset: results.length,
          limit: 50
        }
      );

      results.push(...response.body);

      return response.body.length < 50 ? results : await get(results);
    };

    this.client.me.notificationsUser.fetched = true;

    return (await get()).map((serverNotification) => {
      const existing = this.client.me.notificationsUser.get(serverNotification.id);

      return this.client.me.notificationsUser.set(
        existing
          ? existing.patch(serverNotification)
          : new Notification(this.client, serverNotification)
      );
    });
  }

  async clear () {
    return await this.client.websocket.emit(Command.NOTIFICATION_SUBSCRIBER_CLEAR);
  }

  async delete (notificationIds) {
    return await this.client.websocket.emit(
      Command.NOTIFICATION_SUBSCRIBER_DELETE,
      {
        body: {
          idList: Array.isArray(notificationIds)
            ? notificationIds
            : [notificationIds]
        }
      }
    );
  }

  async getById (notificationId, opts) {
    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds, opts) {
    const notificationsMap = new Map();

    if (!opts?.forceNew) {
      const cachedNotificationUsers = this.cache.getAll(notificationIds)
        .filter((notificationUser) => notificationUser !== null);

      cachedNotificationUsers.forEach((notificationUser) =>
        notificationsMap.set(notificationUser.id, notificationUser)
      );
    }

    const idsToFetch = notificationIds.filter((id) => !notificationsMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_SUBSCRIBER,
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      [...response.body.entries()]
        .filter(([_, res]) => res.success)
        .forEach(([id, res]) => {
          const existing = this.cache.get(id);

          notificationsMap.set(
            res.body.id,
            this.cache.set(
              existing
                ? existing.patch(res.body)
                : new NotificationUser(this.client, res.body)
            )
          );
        });
    }

    return notificationIds.map((id) => notificationsMap.get(id) ?? null);
  }
}

export default NotificationUserHelper;
