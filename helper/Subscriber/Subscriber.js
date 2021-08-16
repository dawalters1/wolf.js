const Helper = require('../Helper');
const validator = require('@dawalters1/validator');
const Response = require('../../networking/Response');

const request = require('../../constants/request');

module.exports = class Subscriber extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._subscribers = [];
  }

  /**
   * Get a list of subscribers by IDs
   * @param {Number} subscriberIds - The ids of the subscribers
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByIds (subscriberIds, requestNew = false) {
    try {
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
        const cached = this._subscribers.filter((subscriber) => subscriberIds.includes(subscriber.id));
        if (cached.length > 0) {
          subscribers.push(...cached);
        }
      }

      if (subscribers.length !== subscriberIds.length) {
        for (const batchSubscriberIdList of this._api.utility().batchArray(subscriberIds.filter((subscriberId) => !subscribers.some((subscriber) => subscriber.id === subscriberId)), 50)) {
          const result = await this._websocket.emit(request.SUBSCRIBER_PROFILE, {
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
    } catch (error) {
      error.method = `Helper/Subscriber/getByIds(subscriberIds = ${JSON.stringify(subscriberIds)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get a subscriber by ID
   * @param {Number} subscriberId - The id of the subscriber
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getById (subscriberId, requestNew = false) {
    try {
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }

      return (await this.getByIds([subscriberId], requestNew))[0];
    } catch (error) {
      error.method = `Helper/Subscriber/getById(subscriberId = ${JSON.stringify(subscriberId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get chat history for a subscriber
   * @param {Number} subscriberId - The id of the subscriber
   * @param {Number} timestamp - The last timestamp in the subscriber (0 for last messages sent)
   */
  async getHistory (subscriberId, timestamp = 0) {
    try {
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

      const result = await this._websocket.emit(request.MESSAGE_PRIVATE_HISTORY_LIST,
        {
          headers: {
            version: 2
          },
          body: {
            id: subscriberId,
            timestampEnd: timestamp === 0 ? null : timestamp
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
            embeds: message.embeds,
            metadata: message.metadata,
            isGroup: message.isGroup,
            timestamp: message.timestamp,
            edited: message.edited,
            type: message.mimeType
          }))
          : []
      };
    } catch (error) {
      error.method = `Helper/Subscriber/history(subscriberId = ${JSON.stringify(subscriberId)}, timestamp = ${JSON.stringify(timestamp)})`;
      throw error;
    }
  }

  _process (subscriber) {
    if (subscriber.exists) {
      const existing = this._subscribers.find((sub) => sub.id === subscriber.id);

      if (existing) {
        for (const key in subscriber) {
          existing[key] = subscriber[key];
        }
      } else {
        this._subscribers.push(subscriber);
      }
    }
    return subscriber;
  }

  _cleanUp () {
    this._subscribers = [];
  }
};
