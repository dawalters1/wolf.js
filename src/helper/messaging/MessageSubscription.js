const BaseHelper = require('../BaseHelper');

const { v4: uuidv4 } = require('uuid');
const { isType } = require('../../validator');

class MessageSubscription extends BaseHelper {
  constructor (api) {
    super(api);

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

    if (subscription.timeout) {
      clearTimeout(subscription.timeout);
    }

    Reflect.deleteProperty(this._subscriptions, id);
  };

  async _createSubscription (predicate, timeout = Infinity) {
    if (Object.values(this._subscriptions).some((subscription) => subscription.predicate === predicate)) {
      throw new Error('subscription is a duplicate');
    }

    const subscription = {
      id: uuidv4(),
      predicate,
      def: undefined
    };

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
      if (!isType(predicate, 'function')) {
        throw new Error('predicate must be function');
      }

      return await this._createSubscription(predicate, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().subscribe().nextMessage(predicate=${JSON.stringify(predicate)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextGroupMessage (targetGroupId, timeout = Infinity) {
    try {
      return await this.subscribeToNextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().subscribe().nextGroupMessage(targetGroupId=${JSON.stringify(targetGroupId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextPrivateMessage (sourceSubscriberId, timeout = Infinity) {
    try {
      return await this.subscribeToNextMessage((message) => !message.isGroup && message.sourceSubscriberId === sourceSubscriberId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().subscribe().nextPrivateMessage(sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async nextGroupSubscriberMessage (targetGroupId, sourceSubscriberId, timeout = Infinity) {
    try {
      return await this.subscribeToNextMessage((message) => message.isGroup && message.targetGroupId === targetGroupId && message.sourceSubscriberId === sourceSubscriberId, timeout);
    } catch (error) {
      error.internalErrorMessage = `api.messaging().subscribe().nextGroupSubscriberMessage(targetGroupId=${JSON.stringify(targetGroupId)}, sourceSubscriberId=${JSON.stringify(sourceSubscriberId)}, timeout=${JSON.stringify(timeout)})`;
      throw error;
    }
  }

  async _cleanup (disconnected = false) {
    if (!disconnected) {
      return Promise.resolve();
    }
    this._subscriptions = [];
  }
}

module.exports = MessageSubscription;
