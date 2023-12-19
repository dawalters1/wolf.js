import Base from '../Base.js';
import { nanoid } from 'nanoid';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscription extends Base {
  constructor (client) {
    super(client);

    this.subscriptions = new Map();

    this.client.on('message', (message) => {
      const subscriptions = this.subscriptions.entries().filter((subscription) => subscription.predicate(message));

      subscriptions.map((subscription) => this.subscriptions.delete(subscription[0]));
      subscriptions.map((subscription) => clearTimeout(subscription[1].timeout));

      return subscriptions.forEach((subscription) => {
        message.id = subscription[0];
        subscription[1].resolver.resolve({ message });
      });
    });
  }

  async _create (predicate, timeout = Infinity) {
    { // eslint-disable-line no-lone-blocks
      if (this.subscriptions.some((subscription) => subscription.predicate === predicate)) {
        throw new models.WOLFAPIError('subscription is a duplicate', { predicate });
      }

      if (timeout !== Infinity) {
        if (validator.isNullOrUndefined(timeout)) {
          throw new models.WOLFAPIError('timeout cannot be null or undefined', { timeout });
        } else if (!validator.isValidNumber(timeout)) {
          throw new models.WOLFAPIError('timeout must be a valid number', { timeout });
        } else if (validator.isLessThanOrEqualZero(timeout)) {
          throw new models.WOLFAPIError('timeout cannot be less than or equal to 0', { timeout });
        }
      }
    }

    const id = nanoid(32);

    const subscription = {
      predicate
    };

    const promise = new Promise((resolve, reject) => {
      subscription.resolver = { resolve, reject };
    });

    subscription.timeout = timeout === Infinity
      ? undefined
      : setTimeout(() => subscription.resolver.resolve(null), timeout);

    this.subscriptions.set(id, subscription);

    return await promise;
  }

  /**
   * Watch for a specific message
   * @param {Function} predicate
   * @param {Number} timeout
   * @returns {Promise<Message | undefined>}
   */
  async nextMessage (predicate, timeout = Infinity) {
    { // eslint-disable-line no-lone-blocks
      if (!validator.isType(predicate, 'function')) {
        throw new models.WOLFAPIError('predicate must be function', { predicate });
      }
    }

    return await this._create(predicate, timeout);
  }

  /**
   * Wait for the next channel message
   * @param {Number} targetChannelId
   * @param {Number} timeout
   * @returns {Promise<Message|undefined>}
   */
  async nextGroupMessage (targetChannelId, timeout = Infinity) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (!validator.isType(targetChannelId, 'number')) {
      throw new models.WOLFAPIError('targetChannelId must be type of number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    return await this.nextMessage((message) => message.isChannel && message.targetChannelId === targetChannelId, timeout);
  }

  /**
   * Wait for the next subscriber message
   * @param {Number} sourceSubscriberId
   * @param {Number} timeout
   * @returns {Promise<Message|undefined>}
   */
  async nextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId cannot be null or undefined', { sourceSubscriberId });
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId must be a valid number', { sourceSubscriberId });
      } else if (!validator.isType(sourceSubscriberId, 'number')) {
        throw new models.WOLFAPIError('sourceSubscriberId must be type of number', { sourceSubscriberId });
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId cannot be less than or equal to 0', { sourceSubscriberId });
      }
    }

    return await this.nextMessage((message) => !message.isChannel && message.sourceSubscriberId === sourceSubscriberId, timeout);
  }

  /**
   * Wait for the next message in a channel by a specific subscriber
   * @param {Number} targetChannelId
   * @param {Number} sourceSubscriberId
   * @param {Number} timeout
   * @returns {Promise<Message|undefined>}
   */
  async nextChannelSubscriberMessage (targetChannelId, sourceSubscriberId, timeout = Infinity) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
      } else if (!validator.isValidNumber(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
      } else if (!validator.isType(targetChannelId, 'number')) {
        throw new models.WOLFAPIError('targetChannelId must be type of number', { targetChannelId });
      } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
        throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
      }

      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId cannot be null or undefined', { sourceSubscriberId });
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId must be a valid number', { sourceSubscriberId });
      } else if (!validator.isType(sourceSubscriberId, 'number')) {
        throw new models.WOLFAPIError('sourceSubscriberId must be type of number', { sourceSubscriberId });
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new models.WOLFAPIError('sourceSubscriberId cannot be less than or equal to 0', { sourceSubscriberId });
      }
    }

    return await this.nextMessage((message) => message.isChannel && message.targetChannelId === targetChannelId && message.sourceSubscriberId === sourceSubscriberId, timeout);
  }

  /**
   * Wait for the next message in a channel by a specific subscriber
   * @param {Number} targetChannelId
   * @param {Number} sourceSubscriberId
   * @param {Number} timeout
   * @returns {Promise<Message|undefined>}
   */
  async nextGroupSubscriberMessage (targetChannelId, sourceSubscriberId, timeout = Infinity) {
    return await this.nextChannelSubscriberMessage(targetChannelId, sourceSubscriberId, timeout);
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return; }

    this.subscriptions.keys().map((subscriptionId) => this.subscriptions.delete(subscriptionId[0]));
    this.subscriptions.clear();
  }
}

export default Subscription;
