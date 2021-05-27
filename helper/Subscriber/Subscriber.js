const Helper = require('../Helper');

const validator = require('../../utils/validator');

const requests = {
  SUBSCRIBER_PROFILE: 'subscriber profile',
  MESSAGE_PRIVATE_HISTORY_LIST: 'message private history list'
};

const Response = require('../../networking/Response');

module.exports = class Tip extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async getByIds (subscriberIds, requestNew = false) {
    if (!validator.isValidArray(subscriberIds)) {
      throw new Error('subscriberIds must be a valid array');
    } else {
      for (const subscriberId of subscriberIds) {
        if (!validator.isValidNumber(subscriberId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }
    }

    subscriberIds = [...new Set(subscriberIds)];

    const subscribers = [];

    if (!requestNew) {
      const cached = this._cache.filter((subscriber) => subscriberIds.includes(subscriber.id));
      if (cached.length > 0) {
        subscribers.push(cached);
      }
    }

    if (subscribers.length !== subscriberIds.length) {
      for (const batchSubscriberIdList of this._bot.utility().batchArray(subscriberIds.filter((subscriberId) => !subscribers.some((subscriber) => subscriber.id === subscriberId)), 50)) {
        const result = await this._websocket.emit(requests.SUBSCRIBER_PROFILE, {
          headers: {
            version: 4
          },
          body: {
            idList: batchSubscriberIdList,
            subscribe: true,
            extended: true
          }
        });

        if (result.success) {
          for (const subscriber of Object.keys(result.body).map((subscriberId) => {
            const value = new Response(result.body[subscriberId.toString()]);
            if (value.success) {
              value.body.exists = true;

              return value.body;
            } else {
              return {
                id: subscriberId,
                exists: false
              };
            }
          })) {
            subscribers.push(this._process(subscriber));
          }
        } else { subscribers.push(batchSubscriberIdList.map((id) => ({ id: id, exists: false }))); }
      }
    }
    return subscribers;
  }

  async getById (subscriberId, requestNew = false) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }
    return (await this.getByIds([subscriberId], requestNew))[0];
  }

  async getHistory (subscriberId, timestamp = 0) {
    if (!validator.isValidNumber(subscriberId)) {
      throw new Error('subscriberId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new Error('subscriberId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(timestamp)) {
      throw new Error('timestamp must be a valid number');
    } else if (validator.isLessThanZero(timestamp)) {
      throw new Error('timestamp cannot be less than 0');
    }

    const result = await this._websocket.emit(requests.MESSAGE_PRIVATE_HISTORY_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: subscriberId,
          timestamp: timestamp === 0 ? null : timestamp
        }
      });

    return {
      code: result.code,
      body: result.success
        ? result.body.map((message) => ({
          id: message.id,
          body: message.data.toString(),
          sourceSubscriberId: message.originator.id,
          groupId: message.isGroup ? message.recipient.id : null,
          embeds: message.embmeds,
          metadata: message.metadata,
          isGroup: message.isGroup,
          timestamp: message.timestamp,
          edited: message.edited
        }))
        : []
    };
  }

  _process (subscriber) {
    if (subscriber.exists) {
      const existing = this._cache.find((sub) => sub.id === subscriber.id);

      if (existing) {
        for (const key in subscriber) {
          existing[key] = subscriber[key];
        }
      } else {
        this._cache.push(subscriber);
      }
    }
    return subscriber;
  }
};
