const BaseHelper = require('../BaseHelper');
const validator = require('../../validator/Validator');
const { request } = require('../../constants');
const patch = require('../../utils/Patch/patch');
const SubscriberObject = require('../../../../Bot-Tag/src/TagSDK/dto/SubscriberObject');

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
        } else if (validator.isValidNumber(subscriberId)) {
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

        for (const subscriberIdBatch of this._api.utility().array().chunk(subscriberIdsToRequest, this._api.botConfig.batch.length)) {
          const result = await this._websocket.emit(
            request.SUBSCRIBER_PROFILE,
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
            const subscriberResponses = result.body.map((subscriberResponse) => new Response(subscriberResponse, request.SUBSCRIBER_PROFILE));

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

  // TODO: subscriber history

  _process (subscriber) {
    subscriber.exists = subscriber.exists || true;

    subscriber = new SubscriberObject(this._api, subscriber);

    if (subscriber.exists) {
      subscriber.language = 'en'; // TODO: Convert actual language into phrase language

      const existing = this._subscribers.find((sub) => sub.id === subscriber.id);

      if (existing) {
        patch(existing, subscriber);
      } else {
        this._subscribers.push(subscriber);
      }
    }

    return subscriber;
  }
}

module.exports = Subscriber;
