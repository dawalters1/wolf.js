import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import models from '../../models/index.js';
import validator from '../../validator/index.js';
class Blocked extends Base {
  async list () {
    if (this.cache.length) {
      return this.cache;
    }
    const response = await this.client.websocket.emit(Command.SUBSCRIBER_BLOCK_LIST, {
      subscribe: true
    });
    this.cache = response.body?.map((contact) => new models.Contact(this.client, contact)) ?? [];
    return this.cache;
  }

  async isBlocked (subscriberIds) {
    subscriberIds = (Array.isArray(subscriberIds) ? subscriberIds : [subscriberIds]).map((id) => validator.isValidNumber(id) ? parseInt(id) : id);
    if (!subscriberIds.length) {
      throw new models.WOLFAPIError('subscriberIds cannot be null or empty', { subscriberIds });
    }
    if ([...new Set(subscriberIds)].length !== subscriberIds.length) {
      throw new models.WOLFAPIError('subscriberIds cannot contain duplicates', { subscriberIds });
    }
    for (const subscriberId of subscriberIds) {
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }
    await this.list();
    const results = subscriberIds.reduce((result, subscriberId) => {
      result.push(this.cache.some((blocked) => blocked.id === subscriberId));
      return result;
    }, []);
    return Array.isArray(subscriberIds) ? results : results[0];
  }

  async block (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }
    return await this.client.websocket.emit(Command.SUBSCRIBER_BLOCK_ADD, {
      id: parseInt(subscriberId)
    });
  }

  async unblock (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
    }
    return await this.client.websocket.emit(Command.SUBSCRIBER_BLOCK_DELETE, {
      id: parseInt(subscriberId)
    });
  }
}
export default Blocked;
