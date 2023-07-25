import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';

class Request extends Base {
  /**
   * Get list of current stage slot requests
   * @param {Number} targetChannelId
   * @param {Boolean} subscribe
   * @param {Boolean} forceNew
   * @returns {Promise<ChannelAudioSlotRequest>}
   */
  async list (targetChannelId, subscribe = true, forceNew = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!forceNew && channel._requestListFetched) {
      return channel.audioRequests;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_LIST,
      {
        id: parseInt(targetChannelId),
        subscribe
      }
    );

    if (response.success) {
      channel._requestListFetched = true;
      channel.audioRequests = response.body.map((request) => new models.ChannelAudioSlotRequest(this.client, request));
    }

    return channel.audioRequests || [];
  }

  /**
   * Add request to stage request list
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @param {Number} subscriberId
   * @returns {Promise<Response>}
   */
  async add (targetChannelId, slotId = undefined, subscriberId = undefined) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (slotId) {
      if (validator.isNullOrUndefined(slotId)) {
        throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
      } else if (!validator.isValidNumber(slotId)) {
        throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
      }

      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('No such channel', { targetChannelId });
    }

    if (!channel.inChannel) {
      throw new models.WOLFAPIError('Not in channel', { targetChannelId });
    }

    if (!channel.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetChannelId });
    }

    const slots = await channel.slots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === parseInt(slotId));

      if (!slot) {
        throw new models.WOLFAPIError('slot does not exist', { targetChannelId, slotId });
      }

      if (slot.locked) {
        throw new models.WOLFAPIError('slot is locked', { targetChannelId, slotId });
      }

      if (slots.some((slot) => slot.occupierId === parseInt(subscriberId))) {
        throw new models.WOLFAPIError('subscriber already occupies a slot in this channel', { targetChannelId, subscriberId });
      }

      if (slots.some((slot) => slot.reservedOccupierId === parseInt(subscriberId))) {
        throw new models.WOLFAPIError('subscriber already has a slot request in this channel', { targetChannelId, subscriberId });
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: parseInt(targetChannelId),
          slotId: parseInt(slotId),
          reservedExpiresAt: Date.now() + 30000,
          reservedOccupierId: parseInt(subscriberId)
        }
      );
    }

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot already occupies a slot in this channel', { targetChannelId });
    }

    if (slots.some((slot) => slot.reservedOccupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot already has a slot request in this channel', { targetChannelId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_ADD,
      {
        id: parseInt(targetChannelId)
      }
    );
  }

  /**
   * Remove a request from stage request list
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response>}
   */
  async delete (targetChannelId, slotId = undefined) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (slotId) {
      if (validator.isNullOrUndefined(slotId)) {
        throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
      } else if (!validator.isValidNumber(slotId)) {
        throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
      }
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('No such channel', { targetChannelId });
    }

    if (!channel.inChannel) {
      throw new models.WOLFAPIError('Not in channel', { targetChannelId });
    }

    if (!channel.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetChannelId });
    }

    const slots = await channel.slots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === parseInt(slotId));

      if (!slot) {
        throw new models.WOLFAPIError('slot does not exist', { targetChannelId, slotId });
      }

      if (slot.locked) {
        throw new models.WOLFAPIError('slot is locked', { targetChannelId, slotId });
      }

      if (slot.occupierId) {
        throw new models.WOLFAPIError('slot request has already been accepted', { targetChannelId, slotId });
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: parseInt(targetChannelId),
          slotId: parseInt(slotId),
          reservedExpiresAt: undefined,
          reservedOccupierId: undefined
        }
      );
    }

    const requests = await channel.getRequestList();

    if (!requests.some((request) => request.subscriberId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot is not in the mic request list', { targetChannelId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_DELETE,
      {
        id: parseInt(targetChannelId)
      }
    );
  }

  /**
   * Clear the channels current stage slot requests
   * @param {Number} targetChannelId
   * @returns {Promise<Request>}
   */
  async clear (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (!validator.isType(targetChannelId, 'number')) {
      throw new models.WOLFAPIError('targetChannelId must be type of number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('No such channel', { targetChannelId });
    }

    if (!channel.inChannel) {
      throw new models.WOLFAPIError('Not in channel', { targetChannelId });
    }

    if (!channel.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetChannelId });
    }

    const requests = await channel.getRequestList();

    if (!requests.length) {
      throw new models.WOLFAPIError('request list is already empty', { targetChannelId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_CLEAR,
      {
        id: parseInt(targetChannelId)
      }
    );
  }
}

export default Request;
