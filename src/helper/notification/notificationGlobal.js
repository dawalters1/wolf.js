import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Notification from '../../entities/notification.js';
import NotificationGlobal from '../../entities/notificationGlobal.js';

class NotificationGlobalHelper extends BaseHelper {
  async list (opts) {
    if (!opts?.forceNew && this.client.me?.notificationsGlobal?.fetched) {
      return this.client.me.notificationsGlobal.values();
    }

    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_GLOBAL_LIST,
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
        : await get(results);
    };

    this.client.me.notificationsGlobal.fetched = true;

    return (await get()).map((serverNotification) => {
      const existing = this.client.me.notificationsGlobal.get(serverNotification.id);

      return this.client.me.notificationsGlobal.set(
        existing
          ? existing.patch(serverNotification)
          : new Notification(this.client, serverNotification)
      );
    });
  }

  async clear () {
    return await this.client.websocket.emit(Command.NOTIFICATION_GLOBAL_CLEAR);
  }

  async delete (notificationIds) {
    return await this.client.websocket.emit(
      Command.NOTIFICATION_GLOBAL_DELETE,
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
      const cachedNotificationGlobals = this.cache.getAll(notificationIds)
        .filter((notificationGlobal) => notificationGlobal !== null);

      cachedNotificationGlobals.forEach((notificationGlobal) => {
        notificationsMap.set(notificationGlobal.id, notificationGlobal);
      });
    }

    const idsToFetch = notificationIds.filter((id) => !notificationsMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_GLOBAL,
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      [...response.body.entries()]
        .filter(([id, res]) => res.success)
        .forEach(([id, res]) => {
          const existing = this.cache.get(id);

          notificationsMap.set(
            res.body.id,
            this.cache.set(
              existing
                ? existing.patch(res.body)
                : new NotificationGlobal(this.client, res.body)
            )
          );
        });
    }

    return notificationIds.map((id) => notificationsMap.get(id) ?? null);
  }
}

export default NotificationGlobalHelper;
