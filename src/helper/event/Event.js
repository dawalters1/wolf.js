const BaseHelper = require('../BaseHelper');
const GroupEvent = require('../../models/GroupEventObject');
const Response = require('../../models/ResponseObject');

const patch = require('../../utils/Patch');
const { Commands } = require('../../constants');
const validator = require('../../validator');

const fileType = require('file-type');

class Event extends BaseHelper {
  constructor (api) {
    super(api);

    this._events = [];
    this._eventList = {};
    this._subscriptions = [];
  }

  async create (targetGroupId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (!validator.isType(title, 'string')) {
        throw new Error('title must be a valid string');
      } else if (validator.isNullOrUndefined(title)) {
        throw new Error('title cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(title)) {
        throw new Error('title cannot be null or whitespace');
      }
      if (!validator.isValidDate(startsAt)) {
        throw new Error('startsAt is not a valid date');
      } else if (new Date(startsAt) < Date.now()) {
        throw new Error('startsAt must be in the future');
      }
      if (!validator.isValidDate(endsAt)) {
        throw new Error('endsAt is not a valid date');
      } else if (new Date(endsAt) < new Date(startsAt)) {
        throw new Error('endsAt must be after startsAt');
      }
      if (!validator.isNullOrWhitespace(shortDescription)) {
        if (!validator.isType(shortDescription, 'string')) {
          throw new Error('shortDescription must be a valid string');
        } else if (validator.isNullOrWhitespace(shortDescription)) {
          throw new Error('shortDescription cannot be null or whitespace');
        }
      }
      if (!validator.isNullOrWhitespace(longDescription)) {
        if (!validator.isType(longDescription, 'string')) {
          throw new Error('longDescription must be a valid string');
        } else if (validator.isNullOrWhitespace(longDescription)) {
          throw new Error('longDescription cannot be null or whitespace');
        }
      }
      if (!validator.isNullOrWhitespace(thumbnail)) {
        if (!validator.isBuffer(thumbnail)) {
          throw new Error('thumbnail must be a valid buffer');
        }
      }

      const result = await this._websocket.emit(
        Commands.GROUP_EVENT_CREATE,
        {
          groupId: targetGroupId,
          title,
          longDescription,
          shortDescription,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt)
        }
      );

      if (result.success && thumbnail) {
        result.body.thumbnailUpload = await this.updateThumbnail(targetGroupId, result.body.id, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
      }

      return result;
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.create(targetGroupId=${JSON.stringify(targetGroupId)}, title=${JSON.stringify(title)}, startsAt=${JSON.stringify(startsAt)}, endsAt=${JSON.stringify(endsAt)}, shortDescription=${JSON.stringify(shortDescription)}, longDescription=${JSON.stringify(longDescription)}, thumbnail=${JSON.stringify(thumbnail ? 'Buffer -- Too long to display' : thumbnail)})`;
      throw error;
    }
  }

  async edit (targetGroupId, eventId, title, startsAt, endsAt, shortDescription = undefined, longDescription = undefined, imageUrl = undefined, thumbnail = undefined) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(eventId)) {
        throw new Error('eventId cannot be null or undefined');
      } else if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }
      if (!validator.isType(title, 'string')) {
        throw new Error('title must be a valid string');
      } else if (validator.isNullOrUndefined(title)) {
        throw new Error('title cannot be null or undefined');
      } else if (validator.isNullOrWhitespace(title)) {
        throw new Error('title cannot be null or whitespace');
      }
      if (!validator.isValidDate(startsAt)) {
        throw new Error('startsAt is not a valid date');
      } else if (new Date(startsAt) < Date.now()) {
        throw new Error('startsAt must be in the future');
      }
      if (!validator.isValidDate(endsAt)) {
        throw new Error('endsAt is not a valid date');
      } else if (new Date(endsAt) < new Date(startsAt)) {
        throw new Error('endsAt must be after startsAt');
      }
      if (!validator.isNullOrWhitespace(shortDescription)) {
        if (!validator.isType(shortDescription, 'string')) {
          throw new Error('shortDescription must be a valid string');
        } else if (validator.isNullOrWhitespace(shortDescription)) {
          throw new Error('shortDescription cannot be null or whitespace');
        }
      }
      if (!validator.isNullOrWhitespace(longDescription)) {
        if (!validator.isType(longDescription, 'string')) {
          throw new Error('longDescription must be a valid string');
        } else if (validator.isNullOrWhitespace(longDescription)) {
          throw new Error('longDescription cannot be null or whitespace');
        }
      }
      if (!validator.isNullOrWhitespace(imageUrl)) {
        if (!validator.isType(imageUrl, 'string')) {
          throw new Error('imageUrl must be a valid string');
        } else if (validator.isNullOrWhitespace(imageUrl)) {
          throw new Error('imageUrl cannot be null or whitespace');
        }
      }
      if (!validator.isNullOrWhitespace(thumbnail)) {
        if (!validator.isBuffer(thumbnail)) {
          throw new Error('thumbnail must be a valid buffer');
        }
      }

      const result = await this._websocket.emit(
        Commands.GROUP_EVENT_UPDATE,
        {
          groupId: targetGroupId,
          id: eventId,
          title,
          longDescription,
          shortDescription,
          imageUrl,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          isRemoved: false
        }
      );

      if (result.success && thumbnail) {
        result.body.thumbnailUpload = await this.updateThumbnail(targetGroupId, result.body.id, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
      }

      return result;
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.edit(targetGroupId=${JSON.stringify(targetGroupId)}, eventId=${JSON.stringify(eventId)} title=${JSON.stringify(title)}, startsAt=${JSON.stringify(startsAt)}, endsAt=${JSON.stringify(endsAt)}, shortDescription=${JSON.stringify(shortDescription)}, longDescription=${JSON.stringify(longDescription)}, imageUrl=${JSON.stringify(imageUrl)} thumbnail=${JSON.stringify(thumbnail ? 'Buffer -- Too long to display' : thumbnail)})`;
      throw error;
    }
  }

  async updateThumbnail (eventId, thumbnail) {
    try {
      if (validator.isNullOrUndefined(eventId)) {
        throw new Error('eventId cannot be null or undefined');
      } else if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (!validator.isType(eventId, 'number')) {
        throw new Error('eventId must be type of number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }
      if (validator.isNullOrWhitespace(thumbnail)) {
        throw new Error('thumbnail cannot be null or whitespace');
      } else if (!validator.isBuffer(thumbnail)) {
        throw new Error('thumbnail must be a valid buffer');
      }

      return this._api._multiMediaService.uploadEventThumbnail(eventId, thumbnail, (await fileType.fromBuffer(thumbnail)).mime);
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.create(eventId=${JSON.stringify(eventId)}, thumbnail=${JSON.stringify(thumbnail ? 'Buffer -- Too long to display' : thumbnail)})`;
      throw error;
    }
  }

  async remove (targetGroupId, eventId) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(eventId)) {
        throw new Error('eventId cannot be null or undefined');
      } else if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (!validator.isType(eventId, 'number')) {
        throw new Error('eventId must be type of number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.GROUP_EVENT_UPDATE,
        {
          groupId: targetGroupId,
          id: eventId,
          isRemoved: true
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.remove(targetGroupId=${JSON.stringify(targetGroupId)}, eventId=${JSON.stringify(eventId)})`;
      throw error;
    }
  }

  async getById (eventId, requestNew = false) {
    return (await this.getByIds(eventId, requestNew))[0];
  }

  async getByIds (eventIds, requestNew = false) {
    try {
      eventIds = Array.isArray(eventIds) ? [...new Set(eventIds)] : [eventIds];

      if (eventIds.length === 0) {
        throw new Error('eventIds cannot be an empty array');
      }
      for (const eventId of eventIds) {
        if (validator.isNullOrUndefined(eventId)) {
          throw new Error('eventId cannot be null or undefined');
        } else if (!validator.isValidNumber(eventId)) {
          throw new Error('eventId must be a valid number');
        } else if (!validator.isType(eventId, 'number')) {
          throw new Error('eventId must be type of number');
        } else if (validator.isLessThanOrEqualZero(eventId)) {
          throw new Error('eventId cannot be less than or equal to 0');
        }
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      let events = [];

      if (!requestNew) {
        events = this._events.filter((event) => eventIds.includes(event.id));
      }

      if (events.length !== eventIds) {
        const eventIdsToRequest = eventIds.filter((eventId) => !events.some((event) => event.id === eventId));

        for (const eventIdBatch of this._api._utility._array.chunk(eventIdsToRequest, this._api._botConfig.get('batch.length'))) {
          const result = await this._websocket.emit(
            Commands.GROUP_EVENT,
            {
              headers: {
                version: 1
              },
              body: {
                idList: eventIdBatch
              }
            }
          );

          if (result.success) {
            const eventResponses = Object.values(result.body).map((eventResponse) => new Response(eventResponse, Commands.GROUP_EVENT));

            for (const [index, eventResponse] of eventResponses.entries()) {
              if (eventResponse.success) {
                events.push(this._process(eventResponse.body));
              } else {
                events.push(
                  {
                    id: eventIdBatch[index],
                    exists: false
                  }
                );
              }
            }
          } else {
            events.push(
              ...eventIdBatch.map((id) =>
                (
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

      return events;
    } catch (error) {
      Reflect.deleteProperty(error, '_api');
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getByIds(eventIds=${JSON.stringify(eventIds)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getGroupEventList (targetGroupId, requestNew = false) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      const result = await this._websocket.emit(
        Commands.GROUP_EVENT_LIST,
        {
          id: targetGroupId,
          subscribe: true
        }
      );

      if (result.success) {
        this._eventList[targetGroupId] = result.body.length > 0 ? await this.getByIds(result.body.map((evt) => evt.id)) : [];
      }

      return this._eventList[targetGroupId] || [];
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getGroupEventList(targetGroupId=${JSON.stringify(targetGroupId)}, requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getSubscriptionList (requestNew = false) {
    try {
      if (!validator.isValidBoolean(requestNew)) {
        throw new Error('requestNew must be a valid boolean');
      }

      if (!requestNew && this._subscriptions.length > 0) {
        return this._subscriptions;
      }

      const result = await this._websocket.emit(
        Commands.SUBSCRIBER_GROUP_EVENT_LIST,
        {
          subscribe: true
        }
      );

      if (result.success) {
        this._subscriptions = result.body;
      }

      return this._subscriptions;
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getSubscriptionList(requestNew=${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async subscribe (eventId) {
    try {
      if (validator.isNullOrUndefined(eventId)) {
        throw new Error('eventId cannot be null or undefined');
      } else if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (!validator.isType(eventId, 'number')) {
        throw new Error('eventId must be type of number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.SUBSCRIBER_GROUP_EVENT_ADD,
        {
          id: eventId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.subscribe(eventId=${JSON.stringify(eventId)})`;
      throw error;
    }
  }

  async unsubscribe (eventId) {
    try {
      if (validator.isNullOrUndefined(eventId)) {
        throw new Error('eventId cannot be null or undefined');
      } else if (!validator.isValidNumber(eventId)) {
        throw new Error('eventId must be a valid number');
      } else if (!validator.isType(eventId, 'number')) {
        throw new Error('eventId must be type of number');
      } else if (validator.isLessThanOrEqualZero(eventId)) {
        throw new Error('eventId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(
        Commands.SUBSCRIBER_GROUP_EVENT_DELETE,
        {
          id: eventId
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.event${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.unsubscribe(eventId=${JSON.stringify(eventId)})`;
      throw error;
    }
  }

  async _cleanup (disconnected) {
    this._events = [];
    this._eventList = {};

    if (!disconnected && this._subscriptions.length > 0) {
      return await this.getSubscriptionList(true);
    }

    this._subscriptions = [];
  }

  _process (event) {
    event = new GroupEvent(this._api, event);
    event.exists = true;

    const existing = this._events.find((evt) => evt.id === event.id);

    if (existing) {
      patch(existing, event);
    } else {
      this._events.push(event);
    }

    if (this._eventList[event.targetGroupId]) {
      const existingGroupEvent = this._eventList[event.targetGroupId].find((evt) => evt.id === event.id);
      if (existingGroupEvent) {
        patch(existingGroupEvent, event);
      } else {
        this._eventList[event.targetGroupId].push(existingGroupEvent);
      }
    }

    const subscription = this._subscriptions.find((evt) => evt.id === event.id);

    if (subscription) {
      patch(subscription, event);
    }

    return event;
  }
}

module.exports = Event;
