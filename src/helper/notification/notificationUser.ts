/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Command } from '../../constants/Command.ts';
import CacheManager from '../../managers/cacheManager.ts';
import { NotificationOptions } from '../../options/requestOptions.ts';
import Notification from '../../structures/notification.ts';
import NotificationUser from '../../structures/notificationUser.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';
import Base from '../base.ts';

class NotificationUserHelper extends Base<CacheManager<NotificationUser, Map<number, NotificationUser>>> {
  async list (opts: NotificationOptions): Promise<Notification[]> {
    if (!opts?.forceNew && this.client.me?.notificationsUser?.fetched) {
      return this.client.me!.notificationsUser.values();
    }

    const get = async (results: Notification[] = []): Promise<Notification[]> => {
      const response = await this.client.websocket.emit<Notification[]>(
        Command.NOTIFICATION_SUBSCRIBER,
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

    return this.client.me!.notificationsUser.mset(await get());
  }

  async clear () : Promise<WOLFResponse> {
    return await this.client.websocket.emit(Command.NOTIFICATION_SUBSCRIBER_CLEAR);
  }

  async delete (notificationIds: number | number[]): Promise<WOLFResponse> {
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

  async getById (notificationId: number, opts?: NotificationOptions): Promise<NotificationUser | null> {
    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds: number[], opts?: NotificationOptions): Promise<(NotificationUser | null)[]> {
    const notificationsMap = new Map<number, NotificationUser | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedNotificationUsers = this.cache!.mget(notificationIds)
        .filter((notificationUser): notificationUser is NotificationUser => notificationUser !== null);

      cachedNotificationUsers.forEach((notificationUser) => notificationsMap.set(notificationUser.id, notificationUser));
    }

    const missingIds = notificationIds.filter((notificationUserId) => !notificationsMap.has(notificationUserId));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<WOLFResponse<NotificationUser>[]>(
        Command.NOTIFICATION_SUBSCRIBER,
        {
          body: {
            idList: missingIds
          }
        }
      );

      response.body.filter((notificationUserResponse) => notificationUserResponse.success)
        .forEach((notificationUserResponse) => notificationsMap.set(notificationUserResponse.body.id, this.cache!.set(notificationUserResponse.body)));
    }

    return notificationIds.map((notificationUserId) => notificationsMap.get(notificationUserId) ?? null);
  }
}

export default NotificationUserHelper;
