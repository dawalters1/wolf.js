
import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import Notification, { ServerNotification } from '../../structures/notification.ts';
import { NotificationOptions } from '../../options/requestOptions.ts';
import NotificationUser, { ServerNotificationUser } from '../../structures/notificationUser.ts';
import WOLFResponse from '../../structures/WOLFResponse.ts';

class NotificationUserHelper extends BaseHelper<NotificationUser> {
  async list (opts: NotificationOptions): Promise<Notification[]> {
    if (!opts?.forceNew && this.client.me?.notificationsUser?.fetched) {
      return this.client.me.notificationsUser.values();
    }

    const get = async (results: Notification[] = []): Promise<Notification[]> => {
      const response = await this.client.websocket.emit<ServerNotification[]>(
        Command.NOTIFICATION_SUBSCRIBER_LIST,
        {
          subscribe: opts?.subscribe ?? true,
          offset: results.length,
          limit: 50
        }
      );

      results.push(...response.body.map((serverNotification) => new Notification(this.client, serverNotification)));

      return response.body.length < 50
        ? results
        : await get(results);
    };

    this.client.me.notificationsUser.fetched = true;

    return this.client.me.notificationsUser.setAll(await get());
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
    const notificationsMap = new Map<number, NotificationUser>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedNotificationUsers = this.cache.getAll(notificationIds)
        .filter((notificationUser): notificationUser is NotificationUser => notificationUser !== null);

      cachedNotificationUsers.forEach((notificationUser) => notificationsMap.set(notificationUser.id, notificationUser));
    }

    const missingIds = notificationIds.filter((notificationUserId) => !notificationsMap.has(notificationUserId));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerNotificationUser>>>(
        Command.NOTIFICATION_SUBSCRIBER,
        {
          body: {
            idList: missingIds
          }
        }
      );

      [...response.body.values()].filter((notificationUserResponse) => notificationUserResponse.success)
        .forEach((notificationUserResponse) => notificationsMap.set(notificationUserResponse.body.id, this.cache.set(new NotificationUser(this.client, notificationUserResponse.body))));
    }

    return notificationIds.map((notificationUserId) => notificationsMap.get(notificationUserId) ?? null);
  }
}

export default NotificationUserHelper;
