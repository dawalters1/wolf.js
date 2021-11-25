const BaseHelper = require('../BaseHelper');
const SubscriberObject = require('../../models/SubscriberObject');
const Message = require('../../models/MessageObject');
const Response = require('../../models/ResponseObject');

const validator = require('../../validator');
const { Commands } = require('../../constants');
const patch = require('../../utils/Patch');
const toLanguageKey = require('../../utils/ToLanguageKey');

class Subscriber extends BaseHelper {
  constructor (api) {
    super(api);

    this._subscribers = [];
  }

  async getById (subscriberId, requestNew = false) {
    return (await this.getByIds(subscriberId, requestNew))[0];
  }

  async getByIds (subscriberIds, requestNew = false) {
    try {
      subscriberIds = Array.isArray(subscriberIds) ? [...new Set(subscriberIds)] : [subscriberIds];

      if (subscriberIds.length === 0) {
        throw new Error('subscriberIds cannot be an empty array');
      }
      for (const subscriberId of subscriberIds) {
        if (validator.isNullOrUndefined(subscriberId)) {
          throw new Error('subscriberId cannot be null or undefined');
        } else if (!validator.isValidNumber(subscriberId)) {
          throw new Error('subscriberId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(subscriberId)) {
          throw new Error('subscriberId cannot be less than or equal to 0');
        }
      }

      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      let subscribers = [];

      if (!requestNew) {
        subscribers = this._subscribers.filter((subscriber) => subscriberIds.includes(subscriber.id));
      }

      if (subscribers.length !== subscriberIds) {
        const subscriberIdsToRequest = subscriberIds.filter((subscriberId) => !subscribers.some((subscriber) => subscriber.id === subscriberId));

        for (const subscriberIdBatch of this._api.utility().array().chunk(subscriberIdsToRequest, this._api._botConfig.batch.length)) {
          const result = await this._websocket.emit(
            Commands.SUBSCRIBER_PROFILE,
            {
              headers: {
                version: 4
              },
              body: {
                idList: subscriberIdBatch,
                extended: true,
                subscriber: true
              }
            }
          );

          if (result.success) {
            const subscriberResponses = Object.values(result.body).map((subscriberResponse) => new Response(subscriberResponse, Commands.SUBSCRIBER_PROFILE));

            for (const [index, subscriberResponse] of subscriberResponses.entries()) {
              if (subscriberResponse.success) {
                subscribers.push(this._process(subscriberResponse.body));
              } else {
                subscribers.push(
                  this._process(
                    {
                      id: subscriberIdBatch[index],
                      exists: false
                    }
                  )
                );
              }
            }
          } else {
            subscribers.push(
              ...subscriberIdBatch.map((id) =>
                this._process(
                  {
                    id,
                    exists: false
                  }
                )
              )
            );
          }
        }
      }

      return subscribers;
    } catch (error) {
      error.internalErrorMessage = `api.subscriber().getByIds(subscriberIds=${JSON.stringify(subscriberIds)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * @deprecated Will be removed in 1.0.0
   * @use {@link getChatHistory}
   */
  async getHistory (subscriberId, timestamp = 0, limit = 15) {
    return await this.getChatHistory(subscriberId, timestamp, limit);
  }

  async getChatHistory (targetSubscriberId, timestamp = 0, limit = 15) {
    try {
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanZero(timestamp)) {
        throw new Error('timestamp cannot be less than 0');
      }
      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (limit < 5) {
        throw new Error('limit cannot be less than 5');
      } else if (limit > 100) {
        throw new Error('limit cannot be larger than 100');
      }

      const result = await this._websocket.emit(
        Commands.MESSAGE_PRIVATE_HISTORY_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: targetSubscriberId,
            limit,
            timestampEnd: timestamp === 0 ? undefined : timestamp
          }
        }
      );

      return result.success ? result.body.map((message) => new Message(this._api, message)) : [];
    } catch (error) {
      error.internalErrorMessage = `api.group().getChatHistory(targetSubscriberId=${JSON.stringify(targetSubscriberId)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)})`;
      throw error;
    }
  }

  _process (subscriber) {
    subscriber.exists = subscriber.exists || true;

    subscriber = new SubscriberObject(this._api, subscriber);

    if (subscriber.exists) {
      subscriber.language = toLanguageKey(subscriber.extended.language);

      const existing = this._subscribers.find((sub) => sub.id === subscriber.id);

      if (existing) {
        patch(existing, subscriber);
      } else {
        this._subscribers.push(subscriber);
      }
    }

    return subscriber;
  }

  async _cleanup () {
    this._subscribers = [];
  }
}

module.exports = Subscriber;
