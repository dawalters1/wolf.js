import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import Notification from '../../entities/notification.js';
import NotificationGlobal from '../../entities/notificationGlobal.js';
import { validate } from '../../validator/index.js';

class NotificationGlobalHelper extends BaseHelper {
  async list (opts) {
    { // eslint-disable-line no-lone-blocks
      validate(opts)
        .isNotRequired()
        .isValidObject();
    }
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

  async deleteById (notificationId) {
    notificationId = Number(notificationId) || notificationId;

    { // eslint-disable-line no-lone-blocks
      validate(notificationId)
        .isNotNullOrUndefined(`NotificationGlobalHelper.deleteById() parameter, notificationId: ${notificationId} is null or undefined`)
        .isValidNumber(`NotificationGlobalHelper.deleteById() parameter, notificationId: ${notificationId} is not a valid number`)
        .isGreaterThanZero(`NotificationGlobalHelper.deleteById() parameter, notificationId: ${notificationId} is less than or equal to zero`);
    }

    return (await this.deleteByIds([notificationId]))[0];
  }

  async deleteByIds (notificationIds) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isValidArray(`NotificationGlobalHelper.deleteByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');
    }
    return await this.client.websocket.emit(
      Command.NOTIFICATION_GLOBAL_DELETE,
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
        .isNotNullOrUndefined(`NotificationGlobalHelper.getById() parameter, notificationId: ${notificationId} is null or undefined`)
        .isValidNumber(`NotificationGlobalHelper.getById() parameter, notificationId: ${notificationId} is not a valid number`)
        .isGreaterThanZero(`NotificationGlobalHelper.getById() parameter, notificationId: ${notificationId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }

    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds, opts) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isValidArray(`NotificationGlobalHelper.getByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }
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
        .filter(([_, res]) => res.success)
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
