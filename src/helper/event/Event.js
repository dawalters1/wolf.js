'use strict';

// Node dependencies

// 3rd Party Dependencies
import { StatusCodes } from 'http-status-codes';
// WOLFjs Dependencies
import verify from 'wolf.js-validator';
// Local Dependencies
import Base from '../Base.js';
import DataManager from '../../managers/DataManager.js';
import EventChannel from './EventChannel.js';
import EventSubscription from './EventSubscription.js';
import structures from '../../structures/index.js';
// Variables
import { Command } from '../../constants/index.js';

class Event extends Base {
  constructor (client) {
    super(client);

    this._events = new DataManager();

    this.eventChannel = new EventChannel(client);
    this.eventSubscription = new EventSubscription(client);
  }

  async getById (eventId, forceNew = false) {
    eventId = Number(eventId) || eventId;

    { // eslint-disable-line no-lone-blocks
      if (!verify.isValidNumber(eventId)) {
        throw new Error(`Event.getById() parameter, eventId: ${JSON.stringify(eventId)}, is not a valid number`);
      } else if (verify.isLessThanOrEqualZero(eventId)) {
        throw new Error(`Event.getById() parameter, eventId: ${JSON.stringify(eventId)}, is zero or negative`);
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Event.getById() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    return (await this.getByIds([eventId], forceNew))[0];
  }

  async getByIds (eventIds, forceNew = false) {
    eventIds = eventIds.map((eventId) => Number(eventId) || eventId);

    { // eslint-disable-line no-lone-blocks
      if (!eventIds.length) {
        throw new Error(`Event.getByIds() parameter, eventIds: ${JSON.stringify(eventIds)}, cannot be an empty array`);
      } else if ([...new Set(eventIds)].length !== eventIds.length) {
        throw new Error(`Event.getByIds() parameter, eventIds: ${JSON.stringify(eventIds)}, cannot contain duplicate ids`);
      } else {
        eventIds.forEach((eventId, index) => {
          if (!verify.isValidNumber(eventId)) {
            throw new Error(`Event.getByIds() parameter, eventIds[${index}]: ${JSON.stringify(eventId)}, is not a valid number`);
          } else if (verify.isLessThanOrEqualZero(eventId)) {
            throw new Error(`Event.getByIds() parameter, eventIds[${index}]: ${JSON.stringify(eventId)}, is zero or negative`);
          }
        });
      }

      if (!verify.isValidBoolean(forceNew)) {
        throw new Error(`Event.getByIds() parameter, forceNew: ${JSON.stringify(forceNew)}, is not a valid boolean`);
      }
    }

    const events = forceNew
      ? []
      : eventIds.map((eventId) => this._events.get(eventId))
        .filter(Boolean);

    if (events.length === eventIds.length) { return events; }

    const idList = eventIds.filter((id) => !events.some((event) => event.id === id));

    try {
      const response = await this.client.websocket.emit(
        Command.GROUP_EVENT,
        {
          body: {
            idList
          }
        }
      );

      response.body.forEach((subResponse, index) =>
        events.push(
          subResponse.success
            ? this._events._add(new structures.Event(this.client, subResponse.body))
            : new structures.Event(this.client, { id: idList[index] })
        )
      );

      // Sort to match ids order
      return eventIds
        .map((id) =>
          events.find((event) => event.id === id)
        );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return null; }

      throw error;
    }
  }
}

export default Event;
