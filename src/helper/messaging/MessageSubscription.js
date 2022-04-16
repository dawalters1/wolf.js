const BaseHelper = require('../BaseHelper');

const validator = require('../../validator');

class MessageSubscription extends BaseHelper {
  constructor (api) {
    super(api);

    this._subscriptionId = 1;
    this._subscriptions = {};

    this._api.on('privateMessage', (message) => this._processMessage(message));
    this._api.on('groupMessage', (message) => this._processMessage(message));
  }

  _processMessage (message) {
    const subscriptions = Object.values(this._subscriptions).filter((subscription) => subscription.predicate(message));

    for (const messageSubscription of subscriptions) {
      message.subscription = messageSubscription.id;
      messageSubscription.def.resolve(message);
    }
  }

  _removeSubscription (id) {
    const subscription = this._subscriptions[id];

    if (subscription) {
      if (subscription.timeout) {
        clearTimeout(subscription.timeout);
      }

      Reflect.deleteProperty(this._subscriptions, id);
    }

    return Promise.resolve();
  };

  async _createSubscription (predicate, timeout = Infinity) {
    if (Object.values(this._subscriptions).some((subscription) => subscription.predicate === predicate)) {
      throw new Error('subscription is a duplicate');
    }

    const subscription = {
      id: this._subscriptionId,
      predicate,
      def: undefined,
      timeout: undefined
    };

    this._subscriptionId += 1;

    this._subscriptions[subscription.id] = subscription;

    if (timeout && timeout !== Infinity && timeout > 0) {
      subscription.timeout = setTimeout(() => {
        subscription.def.resolve(null);
      }, timeout);
    }

    const result = await new Promise((resolve, reject) => {
      subscription.def = { resolve, reject };
    });

    this._removeSubscription(subscription.id);

    return result;
  };

  async nextMessage (predicate, timeout = Infinity) {
    try {
      if (!validator.isType(predicate, 'function')) {
        throw new Error('predicate must be function');
      }

      return await this._createSubscription(predicate, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscribe${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.nextMessage(predicate=${JSON.stringify(predicate)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextGroupMessage (targetGroupId, timeout = Infinity) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      return await this.nextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscribe${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.nextGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    try {
      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (!validator.isType(sourceSubscriberId, 'number')) {
        throw new Error('sourceSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }
      return await this.nextMessage((message) => !message.isGroup && message.sourceSubscriberId === sourceSubscriberId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscribe${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.nextPrivateMessage(sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (!validator.isType(sourceSubscriberId, 'number')) {
        throw new Error('sourceSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }
      return await this.nextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId && message.sourceSubscriberId === sourceSubscriberId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscribe${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.nextGroupSubscriberMessage(targetGroupId=${JSON.stringify(targetGroupId)}, sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async _cleanup (disconnected = false) {
    if (!disconnected) {
      return Promise.resolve();
    }
    this._subscriptionId = 1;
    this._subscriptions = [];
  }
}

module.exports = MessageSubscription;
