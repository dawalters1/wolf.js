import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Slot extends Base {
  /**
   * Get list of slots
   * @param {Number} targetChannelId
   * @param {Boolean} subscribe
   * @returns {Promise<() => Promise<Array<ChannelAudioSlot>>>}
   */
  async list (targetChannelId, subscribe = true) {
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

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Group does not exist', { targetChannelId });
    }

    if (channel.slots?.length) {
      return channel.slots;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        id: parseInt(targetChannelId),
        subscribe
      }
    );

    channel.slots = response.body?.map((slot) => new models.ChannelAudioSlot(this.client, slot, targetChannelId)) ?? [];

    return channel.slots;
  }

  /**
   * Get a channel slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<ChannelAudioSlot>}
   */
  async get (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    // TODO:
    const slot = (await this.list(targetChannelId))?.find((slot) => slot.id === slotId);

    if (!slot) {
      throw new models.WOLFAPIError('Slot does not exist', { slotId });
    }

    return slot;
  }

  /**
   * Lock a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response>}
   */
  async lock (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    await this.get(targetChannelId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        id: parseInt(targetChannelId),
        slot: {
          id: parseInt(slotId),
          locked: true
        }
      }
    );
  }

  /**
   * Unlock a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response>}
   */
  async unlock (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    await this.get(targetChannelId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        id: parseInt(targetChannelId),
        slot: {
          id: parseInt(slotId),
          locked: false
        }
      }
    );
  }

  /**
   * Mute a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response>}
   */
  async mute (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetChannelId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        id: parseInt(targetChannelId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId,
        occupierMuted: true
      }
    );
  }

  /**
   * Unmute a slot
   * @param targetChannelId
   * @param slotId
   * @returns {Promise<Response>}
   */
  async unmute (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetChannelId, slotId);

    if (slot.occupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Occupier of slot must be self to unmute', { targetChannelId, slotId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        id: parseInt(targetChannelId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId,
        occupierMuted: false
      }
    );
  }

  /**
   * Kick a user from a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response>}
   */
  async kick (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetChannelId, slotId);

    if (!slot.occupierId) {
      throw new models.WOLFAPIError('Slot does not have an occupier', { targetChannelId, slotId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        id: parseInt(targetChannelId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId
      }
    );
  }

  /**
   * Join a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @param {String} sdp
   * @returns {Promise<Response<Object>>}
   */
  async join (targetChannelId, slotId, sdp = undefined) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    if (!validator.isUndefined(sdp)) {
      if (validator.isNullOrWhitespace(sdp)) {
        throw new models.WOLFAPIError('sdp cannot be null or whitespace', { sdp });
      }
    }

    const channel = await this.client.channel.getById(targetChannelId);
    const audioConfig = channel.audioConfig;

    if (!audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is not enabled for channel', { targetChannelId });
    }

    if (audioConfig.minRepLevel > Math.floor(this.client.currentSubscriber.reputation)) {
      throw new models.WOLFAPIError(`Stage minimum reputation level is ${audioConfig.minRepLevel}`, { targetChannelId, minRepLevel: audioConfig.minRepLevel, botRepLevel: Math.floor(this.client.currentSubscriber.reputation) });
    }

    const slots = await this.list(targetChannelId);

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('Bot already occupies a slot in this channel', { targetChannelId, slot: slots.find((slot) => slot.occupierId === this.client.currentSubscriber.id) });
    }

    if (slots.every((slot) => !!slot.occupierId)) {
      throw new models.WOLFAPIError('All slots in channel are occupied', { targetChannelId });
    }

    const slot = await this.get(targetChannelId, slotId);

    if (slot.reservedOccupierId && slot.reservedOccupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Slot is reserved for another user', { targetChannelId, slotId });
    }

    if (!sdp) {
      sdp = await (await this.client.stage._getClient(targetChannelId, true)).createSDP();
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST,
      {
        id: parseInt(targetChannelId),
        slotId: parseInt(slotId),
        sdp
      }
    );

    if (response.success) {
      await (await this.client.stage._getClient(targetChannelId, true)).setResponse(slotId, response.body.sdp);
    }

    return response;
  }

  /**
   * Leave a slot
   * @param {Number} targetChannelId
   * @param {Number} slotId
   * @returns {Promise<Response<Object>>}
   */
  async leave (targetChannelId, slotId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetChannelId, slotId);

    if (slot.occupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Slot is not occupied by Bot', { targetChannelId, slotId });
    }

    this.client.stage._deleteClient(targetChannelId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        id: parseInt(targetChannelId),
        slotId: parseInt(slot.id),
        occupierId: this.client.currentSubscriber.id
      }
    );
  }
}

export default Slot;
