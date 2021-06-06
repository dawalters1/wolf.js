const Helper = require('../Helper');
const Response = require('../../networking/Response');
const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

module.exports = class Event extends Helper {
  constructor (bot) {
    super(bot);
    this._events = [];
    this._eventList = {};
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
        this._eventList[groupId] = result.body;
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
        const cached = this._events.filter((group) => eventIds.includes(group.id));
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

  async createEvent (groupId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined) {
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

      return await this._websocket.emit(request.GROUP_EVENT_CREATE, {
        endsAt,
        groupId,
        longDescription,
        shortDescription,
        startsAt,
        title
      });
    } catch (error) {
      error.method = `Helper/Event/createEvent(groupId = ${JSON.stringify(groupId)}, title = ${JSON.stringify(title)}, startsAt = ${JSON.stringify(startsAt)}, endsAt = ${JSON.stringify(endsAt)}, shortDescription = ${JSON.stringify(shortDescription)}, longDescription = ${JSON.stringify(longDescription)})`;
      throw error;
    }
  }

  async updateEvent (groupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined) {
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

      return await this._websocket.emit(request.GROUP_EVENT_UPDATE, {
        id: eventId,
        endsAt,
        groupId,
        longDescription,
        shortDescription,
        startsAt,
        title,
        imageUrl
      });
    } catch (error) {
      error.method = `Helper/Event/updateEvent(groupId = ${JSON.stringify(groupId)}, eventId = ${JSON.stringify(eventId)}, title = ${JSON.stringify(title)}, startsAt = ${JSON.stringify(startsAt)}, endsAt = ${JSON.stringify(endsAt)}, shortDescription = ${JSON.stringify(shortDescription)}, longDescription = ${JSON.stringify(longDescription)}, imageUrl = ${JSON.stringify(imageUrl)}, isRemoved = ${JSON.stringify(false)})`;
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

  _cleanUp () {
    this._eventList = {};
    this._events = [];
  }
};
