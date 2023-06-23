import { Command } from '../../constants/index.js';
import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Slot extends Base {
  async list (targetGroupId, subscribe = true) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!validator.isValidBoolean(subscribe)) {
      throw new models.WOLFAPIError('subscribe must be a valid boolean', { subscribe });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Group does not exist', { targetGroupId });
    }

    if (channel.slots?.length) {
      return channel.slots;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe
      }
    );

    channel.slots = response.body?.map((slot) => new models.GroupAudioSlot(this.client, slot, targetGroupId)) ?? [];

    return channel.slots;
  }

  async get (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = (await this.list(targetGroupId))?.find((slot) => slot.id === slotId);

    if (!slot) {
      throw new models.WOLFAPIError('Slot does not exist', { slotId });
    }

    return slot;
  }

  async lock (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }
    await this.get(targetGroupId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        id: parseInt(targetGroupId),
        slot: {
          id: parseInt(slotId),
          locked: true
        }
      }
    );
  }

  async unlock (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }
    await this.get(targetGroupId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_UPDATE,
      {
        id: parseInt(targetGroupId),
        slot: {
          id: parseInt(slotId),
          locked: false
        }
      }
    );
  }

  async mute (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetGroupId, slotId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId,
        occupierMuted: true
      }
    );
  }

  async unmute (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (slot.occupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Occupier of slot must be self to unmute', { targetGroupId, slotId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_UPDATE,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId,
        occupierMuted: false
      }
    );
  }

  async kick (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (!slot.occupierId) {
      throw new models.WOLFAPIError('Slot does not have an occupier', { targetGroupId, slotId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slotId),
        occupierId: slot.occupierId
      }
    );
  }

  async join (targetGroupId, slotId, sdp = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const channel = await this.client.channel.getById(targetGroupId);
    const audioConfig = channel.audioConfig;

    if (!audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is not enabled for channel', { targetGroupId });
    }

    if (audioConfig.minRepLevel > Math.floor(this.client.currentSubscriber.reputation)) {
      throw new models.WOLFAPIError(`Stage minimum reputation level is ${audioConfig.minRepLevel}`, { targetGroupId, minRepLevel: audioConfig.minRepLevel, botRepLevel: Math.floor(this.client.currentSubscriber.reputation) });
    }

    const slots = await this.list(targetGroupId);

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('Bot already occupies a slot in this channel', { targetGroupId, slot: slots.find((slot) => slot.occupierId === this.client.currentSubscriber.id) });
    }

    if (slots.every((slot) => !!slot.occupierId)) {
      throw new models.WOLFAPIError('All slots in channel are occupied', { targetGroupId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (slot.reservedOccupierId && slot.reservedOccupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Slot is reserved for another user', { targetGroupId, slotId });
    }

    if (!sdp) {
      sdp = await (await this.client.stage._getClient(targetGroupId, true)).createSDP();
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slotId),
        sdp
      }
    );

    if (response.success) {
      await (await this.client.stage._getClient(targetGroupId, true)).setResponse(slotId, response.body.sdp);
    }

    return response;
  }

  async leave (targetGroupId, slotId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (validator.isNullOrUndefined(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be null or undefined', { slotId });
    } else if (!validator.isValidNumber(slotId)) {
      throw new models.WOLFAPIError('slotId must be a valid number', { slotId });
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new models.WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (slot.occupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Slot is not occupied by Bot', { targetGroupId, slotId });
    }

    this.client.stage._deleteClient(targetGroupId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slot.id),
        occupierId: this.client.currentSubscriber.id
      }
    );
  }
}

export default Slot;
