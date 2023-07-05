import Command from '../../constants/Command.js';
import Language from '../../constants/Language.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
import Base from '../Base.js';
import _ from 'lodash';
import patch from '../../utils/patch.js';

class Subscriber extends Base {
  constructor (client) {
    super(client);

    this._list = [];
    this._requested = false;
    this.notifications = [];
  }

  async getById (id, languageId, forceNew = false) {
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

    return (await this.getByIds(id, languageId, forceNew))[0];
  }

  async getByIds (ids, languageId, forceNew = false) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const notifications = forceNew
      ? []
      : this.notifications.filter((notification) => ids.includes(notification.id) && notification.feed.languageId === parseInt(languageId));

    if (notifications.length !== ids.length) {
      const idLists = _.chunk(ids.filter((notificationId) => !notifications.some((notification) => notification.id === notificationId)), this.client._frameworkConfig.get('batching.length'));

      for (const idList of idLists) {
        const response = await this.client.websocket.emit(
          Command.NOTIFICATION_SUBSCRIBER,
          {
            body: {
              idList,
              languageId: parseInt(languageId)
            }
          }
        );

        if (response.success) {
          const notificationResponses = Object.values(response.body).map((notificationResponse) => new models.Response(notificationResponse));

          for (const [index, notificationResponse] of notificationResponses.entries()) {
            notifications.push(notificationResponse.success ? this._process(new models.Notification(this.client, notificationResponse.body)) : new models.Notification(this.client, { id: idList[index] }));
          }
        } else {
          notifications.push(...idList.map((id) => new models.Notification(this.client, { id })));
        }
      }
    }

    return notifications;
  }
  async list (languageId, subscribe = true, forceNew = false) {
    if (!validator.isValidNumber(languageId)) {
      throw new models.WOLFAPIError('languageId must be a valid number', { languageId });
    } else if (!Object.values(Language).includes(parseInt(languageId))) {
      throw new models.WOLFAPIError('languageId is not valid', { languageId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const getNotificationList = async (batchNumber = 0) => {
      const response = await this.client.websocket.emit(
        Command.NOTIFICATION_SUBSCRIBER_LIST,
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

  async clear () {
    const response = await this.client.websocket.emit(Command.NOTIFICATION_SUBSCRIBER_CLEAR);

    if (response.success) {
      this._list = [];
    }

    return response;
  }

  async delete (ids) {
    const values = (Array.isArray(ids) ? ids : [ids]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);

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

    const response = await this.client.websocket.emit(
      Command.NOTIFICATION_SUBSCRIBER_DELETE,
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

export default Subscriber;
