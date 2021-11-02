const Helper = require('../Helper');
const validator = require('../../validator');

const Response = require('../../networking/Response');

const request = require('../../constants/request');
const fileType = require('file-type');

/**
 * {@hideconstructor}
 */
module.exports = class Event extends Helper {
  constructor (api) {
    super(api);
    this._events = [];
    this._eventList = {};
    this._subscriptions = [];
  }

  /**
   * Get a list of events for a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getGroupEvents (targetGroupId, requestNew = false) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }
    if (!requestNew && this._eventList[targetGroupId]) {
      return this._eventList[targetGroupId];
    }

    const result = await this._websocket.emit(request.GROUP_EVENT_LIST, {
      id: targetGroupId,
      subscribe: true
    });

    if (result.success) {
      this._eventList[targetGroupId] = await this.getByIds(result.body.map((evt) => evt.id));
    }

    return this._eventList[targetGroupId] || [];
  }

  /**
   * Get details about events by ID
   * @param {[Number]} eventIds - The ids of the events
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getByIds (eventIds, requestNew = false) {
    eventIds = Array.isArray(eventIds) ? eventIds : [eventIds];

    if (eventIds.length === 0) {
      throw new Error('charmIds cannot be an empty array');
    }

    for (const eventId of eventIds) {
      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }
    }

    eventIds = [...new Set(eventIds)];

    const events = [];

    if (!requestNew) {
      const cached = this._events.filter((evt) => eventIds.includes(evt.id));
      if (cached.length > 0) {
        events.push(...cached);
      }
    }

    if (events.length !== eventIds.length) {
      for (const batchEventIdList of this._api.utility().array().chunk(eventIds.filter((eventId) => !events.some((group) => group.id === eventId)), 50)) {
        const result = await this._websocket.emit(request.GROUP_EVENT, {
          headers: {
            version: 1
          },
          body: {
            idList: batchEventIdList
          }
        });

        if (result.success) {
          for (const [index, event] of result.body.map((resp) => new Response(resp)).entries()) {
            if (event.success) {
              events.push(this._process(event.body));
            } else {
              events.push({ id: batchEventIdList[index], exists: false });
            }
          }
        } else {
          events.push(...batchEventIdList.map((id) => ({ id, exists: false })));
        }
      }
    }

    return events;
  }

  /**
   * Get details about an event by ID
   * @param {Number} eventId - The id of the event
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getById (eventId, requestNew = false) {
    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    return (await this.getByIds([eventId], requestNew))[0];
  }

  /**
   * Create an event for a group
   * @param {Number} targetGroupId - The id of the group to create the event for
   * @param {String} title - The name of the event
   * @param {Date} startsAt - The time at which the event starts
   * @param {Date} endsAt - The time at which the event ends
   * @param {String} shortDescription - A short brief description about the event (Optional)
   * @param {String} longDescription - The long description about the event (Optional)
   * @param {Buffer} thumbnail - The event thumbnail (Optional)
   */
  async createEvent (targetGroupId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(title)) {
      throw new Error('title cannot be null or empty');
    }

    if (!validator.isValidDate(startsAt)) {
      throw new Error('startsAt is not a valid time');
    } else if (new Date(startsAt) <= Date.now()) {
      throw new Error('startsAt must be in the future');
    }

    if (!validator.isValidDate(endsAt)) {
      throw new Error('endsAt is not a valid time');
    } else if (new Date(endsAt) <= new Date(startsAt)) {
      throw new Error('endsAt must be after startsAt');
    }

    if (thumbnail !== undefined && !Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    const result = await this._websocket.emit(request.GROUP_EVENT_CREATE, {
      endsAt: new Date(endsAt),
      groupId: targetGroupId,
      longDescription,
      shortDescription,
      startsAt: new Date(startsAt),
      title
    });

    if (result.success && thumbnail !== undefined) {
      result.body.imageUpload = await this._api._mediaService().uploadEventAvatar(result.body.id, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
    }

    return result;
  }

  /**
   * Update an existing event for a group
   * @param {Number} targetGroupId - The id of the group to create the event for
   * @param {Number} eventId - The id of the event in which to update
   * @param {String} title - The name of the event
   * @param {Date} startsAt - The time at which the event starts
   * @param {Date} endsAt - The time at which the event ends
   * @param {String} shortDescription - A short brief description about the event (Optional)
   * @param {String} longDescription - The long description about the event (Optional)
   * @param {String} imageUrl - The current url for the event thumbnail
   * @param {Buffer} thumbnail - The event thumbnail (Optional)
   */
  async updateEvent (targetGroupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, thumbnail = undefined) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(title)) {
      throw new Error('title cannot be null or empty');
    }

    if (!validator.isValidDate(startsAt)) {
      throw new Error('startsAt is not a valid time');
    } else if (new Date(startsAt) <= Date.now()) {
      throw new Error('startsAt must be in the future');
    }

    if (!validator.isValidDate(endsAt)) {
      throw new Error('endsAt is not a valid time');
    } else if (new Date(endsAt) <= new Date(startsAt)) {
      throw new Error('endsAt must be after startsAt');
    }

    if (thumbnail !== undefined && !Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    const result = await this._websocket.emit(request.GROUP_EVENT_UPDATE, {
      id: eventId,
      endsAt: new Date(endsAt),
      groupId: targetGroupId,
      longDescription,
      shortDescription,
      startsAt: new Date(startsAt),
      title,
      imageUrl,
      isRemoved: false
    });

    if (result.success && thumbnail !== undefined) {
      result.body.imageUpload = await this._api._mediaService().uploadEventAvatar(eventId, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
    }

    return result;
  }

  /**
   * Update an event thumbnail
   * @param {Number} eventId - The id of the event
   * @param {Buffer} thumbnail - The thumbnail for the event
   */
  async updateEventThumbnail (eventId, thumbnail) {
    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    if (thumbnail !== undefined && !Buffer.isBuffer(thumbnail)) {
      throw new Error('thumbnail must be a buffer');
    }

    return await this._api._mediaService().uploadEventAvatar(eventId, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
  }

  /**
   * Delete an event for a group
   * @param {Number} targetGroupId - The id of the group
   * @param {Number} eventId - The id of the event
   */
  async deleteEvent (targetGroupId, eventId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.GROUP_EVENT_UPDATE, {
      id: eventId,
      groupId: targetGroupId,
      isRemoved: true
    });
  }

  /**
   * Subscribe to an event
   * @param {Number} eventId - The id of the event
   */
  async subscribeToEvent (eventId) {
    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_GROUP_EVENT_ADD, {
      id: eventId
    });
  }

  /**
   * Unsubscribe to an event
   * @param {Number} eventId - The id of the event
   */
  async unsubscribeFromEvent (eventId) {
    if (!validator.isValidNumber(eventId)) {
      throw new Error('eventId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(eventId)) {
      throw new Error('eventId cannot be less than or equal to 0');
    }

    return await this._websocket.emit(request.SUBSCRIBER_GROUP_EVENT_DELETE, {
      id: eventId
    });
  }

  /**
   * Request a list of all subscribed events
   * @param {Boolean} requestNew - Request new data from the server
   * @returns
   */
  async getEventSubscriptions (requestNew = false) {
    if (!requestNew && this._subscriptions.length > 0) {
      return this._subscriptions;
    }

    const result = await this._websocket.emit(request.SUBSCRIBER_GROUP_EVENT_LIST,
      {
        subscribe: true
      });

    if (result.success) {
      this._subscriptions = result.body;
    }

    return this._subscriptions || [];
  }

  _process (event) {
    if (event.isRemoved) {
      this._events = this._events.filter((evt) => evt.id !== event.id);

      if (this._eventList[event.targetGroupId]) {
        this._eventList[event.targetGroupId] = this._eventList[event.targetGroupId].filter((evt) => evt.id !== event.id);
      }
    } else {
      const existing = this._events.find((evt) => evt.id === event.id);

      if (existing) {
        for (const key in event) {
          existing[key] = event[key];
        }

        if (this._eventList[event.targetGroupId]) {
          const groupEvent = this._eventList[event.targetGroupId].find((evt) => evt.id === event.id);
          for (const key in event) {
            groupEvent[key] = event[key];
          }
        }
      } else {
        this._events.push(event);

        if (this._eventList[event.targetGroupId]) {
          this._eventList[event.targetGroupId].push(event);
        } else {
          this._eventList[event.targetGroupId] = [event];
        }
      }
    }

    return event;
  }

  _subscription (subscription) {
    const existing = this._subscriptions.find((sub) => sub.id === subscription.id);

    if (existing) {
      this._subscriptions = this._subscriptions.filter((sub) => sub.id !== subscription.id);
    } else {
      this._subscriptions.push(subscription);
    }

    return subscription;
  }

  _clearCache () {
    this._eventList = {};
    this._events = [];
    this._subscriptions = [];
  }
};
