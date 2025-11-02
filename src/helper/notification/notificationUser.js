import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Notification from '../../entities/notification.js';
import NotificationUser from '../../entities/notificationUser.js';
import { validate } from '../../validator/index.js';

class NotificationUserHelper extends BaseHelper {
  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'NotificationUserHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
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

      return response.body.length < 50
        ? results
        : await get(results);
    };

    this.client.me.notificationsUser.fetched = true;

    return (await get()).map((serverNotification) => {
      const existing = this.client.me.notificationsUser.get(serverNotification);

      return this.client.me.notificationsUser.set(
        existing?.patch(serverNotification) ?? new Notification(this.client, serverNotification)
      );
    });
  }

  async clear () {
    return await this.client.websocket.emit(Command.NOTIFICATION_SUBSCRIBER_CLEAR);
  }

  async deleteById (notificationId) {
    notificationId = Number(notificationId) || notificationId;

    { // eslint-disable-line no-lone-blocks
      validate(notificationId)
        .isNotNullOrUndefined(`NotificationUserHelper.deleteById() parameter, notificationId: ${notificationId} is null or undefined`)
        .isValidNumber(`NotificationUserHelper.deleteById() parameter, notificationId: ${notificationId} is not a valid number`)
        .isGreaterThan(0, `NotificationUserHelper.deleteById() parameter, notificationId: ${notificationId} is less than or equal to zero`);
    }

    return await this.deleteByIds([notificationId]);
  }

  async deleteByIds (notificationIds) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isArray(`NotificationUserHelper.deleteByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationUserHelper.deleteByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationUserHelper.deleteByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'NotificationUserHelper.deleteByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');
    }

    return await this.client.websocket.emit(
      Command.NOTIFICATION_SUBSCRIBER_DELETE,
      {
        body: {
          idList: notificationIds
        }
      }
    );
  }

  async getById (notificationId, opts) {
    notificationId = Number(notificationId) || notificationId;

    { // eslint-disable-line no-lone-blocks
      validate(notificationId)
        .isNotNullOrUndefined(`NotificationUserHelper.getById() parameter, notificationId: ${notificationId} is null or undefined`)
        .isValidNumber(`NotificationUserHelper.getById() parameter, notificationId: ${notificationId} is not a valid number`)
        .isGreaterThan(0, `NotificationUserHelper.getById() parameter, notificationId: ${notificationId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'NotificationUserHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds, opts) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isArray(`NotificationUserHelper.getByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationUserHelper.getByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationUserHelper.getByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'NotificationUserHelper.getByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'NotificationUserHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }
    const notificationsMap = new Map();

    if (!opts?.forceNew) {
      const cachedNotificationUsers = notificationIds.map((notificationId) => this.cache.get(notificationId))
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
              existing?.patch(res.body) ?? new NotificationUser(this.client, res.body),
              response.headers?.maxAge
            )
          );
        });
    }

    return notificationIds.map((id) => notificationsMap.get(id) ?? null);
  }
}

export default NotificationUserHelper;
