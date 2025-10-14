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
    if (!opts?.forceNew && this.client.me?.notifications.user?.fetched) {
      return this.client.me._notifications.user.values();
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

    this.client.me._notifications.user._fetched = true;

    return (await get())
      .map((serverNotification) =>
        this.client.me._notifications.user.set(
          new Notification(this.client, serverNotification)
        )
      );
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

    return (await this.deleteByIds([notificationId]))[0];
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

    const idsToFetch = opts?.forceNew
      ? notificationIds
      : notificationIds.filter((notificationId) =>
        !this.store.has((notification) => notification.id === notificationId)
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_SUBSCRIBER,
        {
          body: {
            idList: idsToFetch
          }
        }
      );

      for (const [index, notificationResponse] of response.body.entries()) {
        const notificationId = idsToFetch[index];

        if (!notificationResponse.success) {
          this.client.me._notifications.user.delete((notification) => notification.id === notificationId);
          continue;
        }

        this.client.me._notifications.user.set(
          new NotificationUser(this.client, notificationResponse.body),
          response.headers?.maxAge
        );
      }
    }

    return notificationIds.map((notificationId) =>
      this.client.me._notifications.user.get((notification) => notification.id === notificationId)
    );
  }
}

export default NotificationUserHelper;
