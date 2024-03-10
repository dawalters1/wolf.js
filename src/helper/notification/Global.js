import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Base from '../Base.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

class Global extends Base {
  constructor (client) {
    super(client);

    this._requested = {

    };
    this._requested = false;
    this.notifications = [];
  }

  /**
   * Get a global notification
   * @param {Number} id
   * @param {Number} languageId
   * @param {Boolean} forceNew
   * @returns {Promise<Notification>}
   */
  async getById (id, languageId, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { id });
      } else if (!validator.isValidNumber(id)) {
        throw new models.WOLFAPIError('id must be a valid number', { id });
      } else if (validator.isLessThanOrEqualZero(id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
      }

      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    return (await this.getByIds(id, languageId, forceNew))[0];
  }

  /**
   * Get multiple global notifications
   * @param {Number | Number[]} ids
   * @param {Number} languageId
   * @param {Boolean} forceNew
   * @returns {Promise<Notification | Array<Notification>>}
   */
  async getByIds (ids, languageId, forceNew = false) {
    ids = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!ids.length) {
        return [];
      }

      if ([...new Set(ids)].length !== ids.length) {
        throw new models.WOLFAPIError('ids cannot contain duplicates', { ids });
      }

      for (const id of ids) {
        if (validator.isNullOrUndefined(id)) {
          throw new models.WOLFAPIError('id cannot be null or undefined', { id });
        } else if (!validator.isValidNumber(id)) {
          throw new models.WOLFAPIError('id must be a valid number', { id });
        } else if (validator.isLessThanOrEqualZero(id)) {
          throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
        }
      }

      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }
    }

    const notifications = forceNew
      ? []
      : this.notifications.filter((notification) => ids.includes(notification.id) && notification.feed.languageId === parseInt(languageId));

    if (notifications.length === ids.length) {
      return notifications;
    }

    const idLists = _.chunk(ids.filter((notificationId) => !notifications.some((notification) => notification.id === notificationId)), this.client._frameworkConfig.get('batching.length'));

    for (const idList of idLists) {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_GLOBAL,
        {
          body: {
            idList,
            languageId: parseInt(languageId)
          }
        }
      );

      if (response.success) {
        notifications.push(...Object.values(response.body)
          .map((notificationResponse) => new models.Response(notificationResponse))
          .map((notificationResponse, index) =>
            notificationResponse.success
              ? this._process(new models.Notification(this.client, notificationResponse.body))
              : new models.Notification(this.client, { id: idList[index] })
          )
        );
      } else {
        notifications.push(...idList.map((id) => new models.Notification(this.client, { id })));
      }
    }

    return notifications;
  }

  /**
   * Get your accounts global notifications list
   * @param {Number} languageId
   * @param {Boolean} subscribe
   * @param {Boolean} forceNew
   * @returns {Promise<*|[]|Notification|Array<Notification>|*[]>}
   */
  async list (languageId, subscribe = true, forceNew = false) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isValidNumber(languageId)) {
        throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
      } else if (!Object.values(Language).includes(parseInt(languageId))) {
        throw new models.WOLFAPIError('languageId is not valid', { languageId });
      }

      if (!validator.isValidBoolean(subscribe)) {
        throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
      }

      if (!validator.isValidBoolean(forceNew)) {
        throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
      }

      if (!forceNew && this._requested) {
        return this._list.length ? await this.getByIds(this._list, languageId, forceNew) : [];
      }
    }

    const getNotificationList = async (batchNumber = 0) => {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_GLOBAL_LIST,
        {
          subscribe,
          limit: 100,
          offset: batchNumber
        }
      );

      if (response.success) {
        this._list.push(...response.body.map((notification) => notification.id));
      }

      if (response.body.length >= 100) {
        return await getNotificationList(batchNumber + 100);
      }

      this._requested = true;

      return this._list.length ? await this.getByIds(this._list, languageId, forceNew) : [];
    };

    return getNotificationList();
  }

  /**
   * Clear the accounts global notifications list
   * @returns {Promise<Response>}
   */
  async clear () {
    const response = await this.client.websocket.emit(Command.NOTIFICATION_GLOBAL_CLEAR);

    if (response.success) {
      this._list = [];
    }

    return response;
  }

  /**
   * Delete global notifications
   * @param {Number | Number[]} ids
   * @returns {Promise<Response>}
   */
  async delete (ids) {
    const values = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

    { // eslint-disable-line no-lone-blocks
      if (!values.length) {
        throw new models.WOLFAPIError('values cannot be null or empty', { ids });
      }

      if ([...new Set(values)].length !== values.length) {
        throw new models.WOLFAPIError('values cannot contain duplicates', { ids });
      }

      for (const id of values) {
        if (validator.isNullOrUndefined(id)) {
          throw new models.WOLFAPIError('id cannot be null or undefined', { id });
        } else if (!validator.isValidNumber(id)) {
          throw new models.WOLFAPIError('id must be a valid number', { id });
        } else if (validator.isLessThanOrEqualZero(id)) {
          throw new models.WOLFAPIError('id cannot be less than or equal to 0', { id });
        }
      }
    }

    const response = await this.client.websocket.emit(
      Command.NOTIFICATION_GLOBAL_DELETE,
      {
        idList: values
      }
    );

    if (response.success) {
      this.notifications = this.notifications.filter((notification) => !values.includes(notification.id));
    }

    return response;
  }

  _process (value) {
    const existing = this.notifications.find((notification) => notification.id === value.id && notification.feed.languageId === value.feed.languageId);

    existing ? patch(existing, value) : this.notifications.push(value);

    return value;
  }

  _cleanUp (reconnection = false) {
    this.notifications = [];
    this._list = [];
    this._requested = false;
  }
}

export default Global;
