const Helper = require('../Helper');
const Response = require('../../networking/Response');
const validator = require('@dawalters1/validator');
const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

module.exports = class Event extends Helper {
  constructor (bot) {
    super(bot);
    this._events = [];
    this._groupEvents = {};
  }

  async getGroupEvents (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      if (!requestNew && this._cache.groups[groupId]) {
        return this._cache.groups[groupId];
      }

      const result = await this._websocket.emit(request.GROUP_EVENT_LIST, {
        id: groupId,
        subscribe: true
      });

      if (result.success) {
        this._cache.groups[groupId] = result.body;
      }

      return this._cache.groups[groupId] || [];
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

  _process (event) {

  }

  _cleanUp () {
    this._cache = {};
  }
};
