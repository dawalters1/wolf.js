
import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import Notification, { ServerNotification } from '../../structures/notification.ts';
import NotificationGlobal, { ServerNotificationGlobal } from '../../structures/notificationGlobal.ts';
import { NotificationOptions } from '../../options/requestOptions.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class NotificationGlobalHelper extends BaseHelper<NotificationGlobal> {
  async list (opts: NotificationOptions): Promise<Notification[]> {
    if (!opts?.forceNew && this.client.me?.notificationsGlobal?.fetched) {
      return this.client.me.notificationsGlobal.values();
    }

    const get = async (results: ServerNotification[] = []): Promise<ServerNotification[]> => {
      const response = await this.client.websocket.emit<ServerNotification[]>(
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

  async clear (): Promise<WOLFResponse> {
    return await this.client.websocket.emit(Command.NOTIFICATION_GLOBAL_CLEAR);
  }

  async delete (notificationIds: number | number[]): Promise<WOLFResponse> {
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

  async getById (notificationId: number, opts?: NotificationOptions): Promise<NotificationGlobal | null> {
    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds: number[], opts?: NotificationOptions): Promise<(NotificationGlobal | null)[]> {
    const notificationsMap = new Map<number, NotificationGlobal>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedNotificationGlobals = this.cache.getAll(notificationIds)
        .filter((notificationGlobal): notificationGlobal is NotificationGlobal => notificationGlobal !== null);

      cachedNotificationGlobals.forEach((notificationGlobal) => notificationsMap.set(notificationGlobal.id, notificationGlobal));
    }

    const idsToFetch = notificationIds.filter((notificationGlobalId) => !notificationsMap.has(notificationGlobalId));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerNotificationGlobal>>>(
        Command.NOTIFICATION_GLOBAL,
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      [...response.body.entries()]
        .filter(([notificationId, notificationGlobalResponse]) => notificationGlobalResponse.success)
        .forEach(([notificationId, notificationGlobalResponse]) => {
          const existing = this.cache.get(notificationId);

          notificationsMap.set(
            notificationGlobalResponse.body.id,
            this.cache.set(
              existing
                ? existing.patch(notificationGlobalResponse.body)
                : new NotificationGlobal(this.client, notificationGlobalResponse.body)
            )
          );
        });
    }

    return notificationIds.map((notificationGlobalId) => notificationsMap.get(notificationGlobalId) ?? null);
  }
}

export default NotificationGlobalHelper;
