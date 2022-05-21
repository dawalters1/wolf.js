const Base = require('../Base');
const nanoid = require('nanoid');
const WOLFAPIError = require('../../models/WOLFAPIError');
const validator = require('../../validator');

class Subscription extends Base {
  constructor (client) {
    super(client, {});

    this.client.on('message', (message) => {
      const subscriptions = Object.values(this.cache).filter((subscription) => subscription.predicate(message));

      for (const messageSubscription of subscriptions) {
        message.subscription = messageSubscription.id;
        messageSubscription.def.resolve(message);
      }
    });
  }

  async _create (predicate, timeout = Infinity) {
    if (Object.values(this.cache).some((subscription) => subscription.predicate === predicate)) {
      throw new WOLFAPIError('subscription is a duplicate', predicate);
    }

    if (timeout !== Infinity) {
      if (validator.isNullOrUndefined(timeout)) {
        throw new WOLFAPIError('timeout cannot be null or undefined', timeout);
      } else if (!validator.isValidNumber(timeout)) {
        throw new WOLFAPIError('timeout must be a valid number', timeout);
      } else if (validator.isLessThanOrEqualZero(timeout)) {
        throw new WOLFAPIError('timeout cannot be less than or equal to 0', timeout);
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

    const result = await new Promise((resolve, reject) => {
      subscription.def = { resolve, reject };
    });

    clearTimeout(subscription.timeout);

    Reflect.deleteProperty(this.cache, subscription.id);

    return result;
  }

  async nextMessage (predicate, timeout = Infinity) {
    if (!validator.isType(predicate, 'function')) {
      throw new WOLFAPIError('predicate must be function', predicate);
    }

    return await this._createSubscription(predicate, timeout);
  }

  async nextGroupMessage (targetGroupId, timeout = Infinity) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (!validator.isType(targetGroupId, 'number')) {
      throw new WOLFAPIError('targetGroupId must be type of number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }
    return await this.nextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId, timeout);
  }

  async nextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    if (validator.isNullOrUndefined(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId cannot be null or undefined', sourceSubscriberId);
    } else if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId must be a valid number', sourceSubscriberId);
    } else if (!validator.isType(sourceSubscriberId, 'number')) {
      throw new WOLFAPIError('sourceSubscriberId must be type of number', sourceSubscriberId);
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId cannot be less than or equal to 0', sourceSubscriberId);
    }
    return await this.nextMessage((message) => !message.isGroup && message.sourceSubscriberId === sourceSubscriberId, timeout);
  }

  async nextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (!validator.isType(targetGroupId, 'number')) {
      throw new WOLFAPIError('targetGroupId must be type of number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }
    if (validator.isNullOrUndefined(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId cannot be null or undefined', sourceSubscriberId);
    } else if (!validator.isValidNumber(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId must be a valid number', sourceSubscriberId);
    } else if (!validator.isType(sourceSubscriberId, 'number')) {
      throw new WOLFAPIError('sourceSubscriberId must be type of number', sourceSubscriberId);
    } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
      throw new WOLFAPIError('sourceSubscriberId cannot be less than or equal to 0', sourceSubscriberId);
    }

    return await this.nextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId && message.sourceSubscriberId === sourceSubscriberId, timeout);
  }
}
module.exports = Subscription;
