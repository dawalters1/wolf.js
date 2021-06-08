const Helper = require('../Helper');
const Response = require('../../networking/Response');
const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

const uploadToMediaService = require('../../utils/uploadToMediaService');
const routes = require('@dawalters1/wolf.js.mms/constants/routes');

const fileType = require('file-type');

module.exports = class Event extends Helper {
  constructor (bot) {
    super(bot);
    this._events = [];
    this._eventList = {};
    this._subscriptions = [];
  }

  async getGroupEvents (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      if (!requestNew && this._eventList[groupId]) {
        return this._eventList[groupId];
      }

      const result = await this._websocket.emit(request.GROUP_EVENT_LIST, {
        id: groupId,
        subscribe: true
      });

      if (result.success) {
        this._eventList[groupId] = await this.getByIds(result.body.map((evt) => evt.id));
      }

      return this._eventList[groupId] || [];
    } catch (error) {
      error.method = `Helper/Event/getGroupEvents(groupId = ${JSON.stringify(groupId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getByIds (eventIds, requestNew = false) {
    try {
      if (!validator.isValidArray(eventIds)) {
        throw new Error('eventIds must be a valid array');
      } else {
        for (const eventId of eventIds) {
          if (!validator.isValidNumber(eventId)) {
            throw new Error('eventId must be a valid number');
          } else if (validator.isLessThanOrEqualZero(eventId)) {
            throw new Error('eventId cannot be less than or equal to 0');
          }
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
        for (const batchEventIdList of this._bot.utility().batchArray(eventIds.filter((eventId) => !events.some((group) => group.id === eventId)), 50)) {
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
    } catch (error) {
      error.method = `Helper/Event/getByIds(eventIds = ${JSON.stringify(eventIds)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getById (eventId, requestNew = false) {
    try {
      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return (await this.getByIds([eventId], requestNew))[0];
    } catch (error) {
      error.method = `Helper/Event/getById(eventId = ${JSON.stringify(eventId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async createEvent (groupId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, image = undefined) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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

      if (image !== undefined && !Buffer.isBuffer(image)) {
        throw new Error('image must be a buffer');
      }
    

      const result = await this._websocket.emit(request.GROUP_EVENT_CREATE, {
        endsAt: new Date(endsAt),
        groupId,
        longDescription,
        shortDescription,
        startsAt: new Date(startsAt),
        title
      });

      if(result.success && image !== undefined){
        result.body.imageUpload = await uploadToMediaService(this._bot, routes.EVENT_IMAGE, image, (await fileType.fromBuffer(image)).mime, result.body.id);
      }

      return result;
    } catch (error) {
      error.method = `Helper/Event/createEvent(groupId = ${JSON.stringify(groupId)}, title = ${JSON.stringify(title)}, startsAt = ${JSON.stringify(startsAt)}, endsAt = ${JSON.stringify(endsAt)}, shortDescription = ${JSON.stringify(shortDescription)}, longDescription = ${JSON.stringify(longDescription)})`;
      throw error;
    }
  }

  async updateEvent (groupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, image = undefined) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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

      if (image !== undefined && !Buffer.isBuffer(image)) {
        throw new Error('image must be a buffer');
      }
    
      const result =  await this._websocket.emit(request.GROUP_EVENT_UPDATE, {
        id: eventId,
        endsAt: new Date(endsAt),
        groupId,
        longDescription,
        shortDescription,
        startsAt: new Date(startsAt),
        title,
        imageUrl,
        isRemoved: false
      });

      if(result.success && image !== undefined){
        result.body.imageUpload = await uploadToMediaService(this._bot, routes.EVENT_IMAGE, image, (await fileType.fromBuffer(image)).mime, eventId);
      }

      return result;
    } catch (error) {
      error.method = `Helper/Event/updateEvent(groupId = ${JSON.stringify(groupId)}, eventId = ${JSON.stringify(eventId)}, title = ${JSON.stringify(title)}, startsAt = ${JSON.stringify(startsAt)}, endsAt = ${JSON.stringify(endsAt)}, shortDescription = ${JSON.stringify(shortDescription)}, longDescription = ${JSON.stringify(longDescription)}, imageUrl = ${JSON.stringify(imageUrl)}, isRemoved = ${JSON.stringify(false)})`;
      throw error;
    }
  }

  async updateEventImage(eventId, image){
    try {
      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      if (image !== undefined && !Buffer.isBuffer(image)) {
        throw new Error('image must be a buffer');
      }
    
      return await uploadToMediaService(this._bot, routes.EVENT_IMAGE, image, (await fileType.fromBuffer(image)).mime, eventId);
    } catch (error) {
      error.method = `Helper/Event/updateEvent(eventId = ${JSON.stringify(groupId)}, image = ${JSON.stringify('too large to display')})`;
      throw error;
    }
  }

  async deleteEvent (groupId, eventId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.GROUP_EVENT_UPDATE, {
        id: eventId,
        groupId,
        isRemoved: true
      });
    } catch (error) {
      error.method = `Helper/Event/deleteEvent(groupId = ${JSON.stringify(groupId)}, eventId = ${JSON.stringify(eventId)}`;
      throw error;
    }
  }

  async subscribeToEvent (eventId) {
    try {
      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.SUBSCRIBER_GROUP_EVENT_ADD, {
        id: eventId
      });
    } catch (error) {
      error.method = `Helper/Event/subscribeToEvent(eventId = ${JSON.stringify(eventId)})`;
      throw error;
    }
  }

  async unsubscribeFromEvent (eventId) {
    try {
      if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.SUBSCRIBER_GROUP_EVENT_DELETE, {
        id: eventId
      });
    } catch (error) {
      error.method = `Helper/Event/unsubscribeFromEvent(eventId = ${JSON.stringify(eventId)})`;
      throw error;
    }
  }

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

      if (this._eventList[event.groupId]) {
        this._eventList[event.groupId] = this._eventList[event.groupId].filter((evt) => evt.id !== event.id);
      }
    } else {
      const existing = this._events.find((evt) => evt.id === event.id);

      if (existing) {
        for (const key in event) {
          existing[key] = event[key];
        }

        if (this._eventList[event.groupId]) {
          const groupEvent = this._eventList[event.groupId].find((evt) => evt.id === event.id);
          for (const key in event) {
            groupEvent[key] = event[key];
          }
        }
      } else {
        this._events.push(event);

        if (this._eventList[event.groupId]) {
          this._eventList[event.groupId].push(event);
        } else {
          this._eventList[event.groupId] = [event];
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

  _cleanUp () {
    this._eventList = {};
    this._events = [];
    this._subscriptions = [];
  }
};
