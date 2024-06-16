import Base from '../Base.js';
import { nanoid } from 'nanoid';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Subscription extends Base {
  constructor (client) {
    super(client);

    this.subscriptions = [];

    this.client.on('message', (message) => {
      const subscriptions = this.subscriptions.filter((subscription) => subscription.predicate(message));

      for (const messageSubscription of subscriptions) {
        message.subscription = messageSubscription.id;
        messageSubscription.def.resolve(message);
      }
    });
  }

  async _create (predicate, timeout = Infinity) {
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

    const subscription = {
      id: nanoid(32),
      predicate,
      def: undefined,
      timeout: undefined
    };

    if (timeout !== Infinity) {
      subscription.timeout = setTimeout(() => subscription.def.resolve(null), timeout);
    }

    this.subscriptions.push(subscription);

    const result = await new Promise((resolve, reject) => {
      subscription.def = { resolve, reject };
    });

    clearTimeout(subscription.timeout);

    this.subscriptions = this.subscriptions.filter((sub) => sub.id !== subscription.id);

    return result;
  }

  /**
   * Watch for a specific message
   * @param {Function} predicate
   * @param {Number} timeout
   * @returns {Promise<Message | undefined>}
   */
  async nextMessage (predicate, timeout = Infinity) {
    if (!validator.isType(predicate, 'function')) {
      throw new models.WOLFAPIError('predicate must be function', { predicate });
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
    if (validator.isNullOrUndefined(sourceSubscriberId)) {
      throw new models.WOLFAPIError('sourceSubscriberId cannot be null or undefined', { sourceSubscriberId });
    } else if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new models.WOLFAPIError('sourceSubscriberId must be a valid number', { sourceSubscriberId });
    } else if (!validator.isType(sourceSubscriberId, 'number')) {
      throw new models.WOLFAPIError('sourceSubscriberId must be type of number', { sourceSubscriberId });
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new models.WOLFAPIError('sourceSubscriberId cannot be less than or equal to 0', { sourceSubscriberId });
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
    if (reconnection) { return false; }

    this.subscriptions = [];
  }
}

export default Subscription;
