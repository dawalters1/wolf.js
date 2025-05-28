/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command } from '../../constants/Command.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { NotificationOptions } from '../../options/requestOptions.ts';
import Notification from '../../structures/notification.ts';
import NotificationGlobal from '../../structures/notificationGlobal.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

class NotificationGlobalHelper extends Base<CacheManager<NotificationGlobal, Map<number, NotificationGlobal>>> {
  async list (opts: NotificationOptions): Promise<Notification[]> {
    if (!opts?.forceNew && this.client.me?.notificationsGlobal?.fetched) {
      return this.client.me!.notificationsGlobal.values();
    }

    const get = async (results: Notification[] = []): Promise<Notification[]> => {
      const response = await this.client.websocket.emit<Notification[]>(
        Command.NOTIFICATION_GLOBAL,
        {
          subscribe: opts?.subscribe ?? true,
          offset: results.length,
          limit: 50
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await get(results);
    };

    return this.client.me!.notificationsGlobal.mset(await get());
  }

  async clear () : Promise<WOLFResponse> {
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
    const notificationsMap = new Map<number, NotificationGlobal | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedNotificationGlobals = this.cache!.mget(notificationIds)
        .filter((notificationGlobal): notificationGlobal is NotificationGlobal => notificationGlobal !== null);

      cachedNotificationGlobals.forEach((notificationGlobal) => notificationsMap.set(notificationGlobal.id, notificationGlobal));
    }

    const missingIds = notificationIds.filter((notificationGlobalId) => !notificationsMap.has(notificationGlobalId));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<WOLFResponse<NotificationGlobal>[]>(
        Command.NOTIFICATION_GLOBAL,
        {
          body: {
            idList: missingIds
          }
        }
      );

      response.body.filter((notificationGlobalResponse) => notificationGlobalResponse.success)
        .forEach((notificationGlobalResponse) => notificationsMap.set(notificationGlobalResponse.body.id, this.cache!.set(notificationGlobalResponse.body)));
    }

    return notificationIds.map((notificationGlobalId) => notificationsMap.get(notificationGlobalId) ?? null);
  }
}

export default NotificationGlobalHelper;
