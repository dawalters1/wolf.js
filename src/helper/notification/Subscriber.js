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

  async list (limit = 50, offset = 0, subscribe = true) {
    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    const response = await this.client.websocket.emit(
      Command.NOTIFICATION_SUBSCRIBER_LIST,
      {
        subscribe,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    // TODO: handle caching of this...
    // Somehow? that supports offsets....

    return response.success ? await this.getByIds(response.body?.map((notification) => notification.id)) : [];
  }

  async clear () {
    const response = await this.client.websocket.emit(Command.NOTIFICATION_SUBSCRIBER_CLEAR);

    if (response.success) {
      this.notifications = [];
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
  }
}

export default Subscriber;
