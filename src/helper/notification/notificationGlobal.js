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
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'NotificationGlobalHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (!opts?.forceNew && this.client.me?.notifications.global?.fetched) {
      return this.client.me.notificationStore.global.values();
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

    this.client.me.notificationStore.global.fetched = true;

    return (await get())
      .map((serverNotification) =>
        this.client.me.notificationStore.global.set(
          new Notification(this.client, serverNotification)
        )
      );
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
        .isGreaterThan(0, `NotificationGlobalHelper.deleteById() parameter, notificationId: ${notificationId} is less than or equal to zero`);
    }

    return (await this.deleteByIds([notificationId]))[0];
  }

  async deleteByIds (notificationIds) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isArray(`NotificationGlobalHelper.deleteByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'NotificationGlobalHelper.deleteByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');
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
        .isGreaterThan(0, `NotificationGlobalHelper.getById() parameter, notificationId: ${notificationId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'NotificationGlobalHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([notificationId], opts))[0];
  }

  async getByIds (notificationIds, opts) {
    notificationIds = notificationIds.map((notificationId) => Number(notificationId) || notificationId);

    { // eslint-disable-line no-lone-blocks
      validate(notificationIds)
        .isArray(`NotificationGlobalHelper.getByIds() parameter, notificationIds: ${notificationIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is null or undefined')
        .isValidNumber('NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'NotificationGlobalHelper.getByIds() parameter, notificationId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'NotificationGlobalHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? notificationIds
      : notificationIds.filter((notificationId) =>
        !this.client.me.notificationStore.global.has((notification) => notification.id === notificationId)
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_GLOBAL,
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      for (const [index, notificationResponse] of response.body.entries()) {
        const notificationId = idsToFetch[index];

        if (!notificationResponse.success) {
          this.client.me.notificationStore.global.delete((notification) => notification.id === notificationId);
          continue;
        }

        this.client.me.notificationStore.global.set(
          new NotificationGlobal(this.client, notificationResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return notificationIds.map((notificationId) =>
      this.client.me.notificationStore.global.get((notification) => notification.id === notificationId)
    );
  }
}

export default NotificationGlobalHelper;
