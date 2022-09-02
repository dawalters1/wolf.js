import { Command } from '../../constants/index.js';
import { Base } from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';

class Slot extends Base {
  async list (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('Group does not exist', { targetGroupId });
    }

    if (group.slots.length) {
      return group.slots;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_SLOT_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe: true
      }
    );

    this.group.slots = response.body?.map((slot) => new models.GroupAudioSlot(this.client, slot)) ?? [];

    return this.group.slots;
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

    const slots = await this.list(targetGroupId);
    const slot = slots.find((slot) => slot.id === slotId);

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

    const group = await this.client.group.getById(targetGroupId);
    const audioConfig = group.audioConfig;

    if (!audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is not enabled for Group', { targetGroupId });
    }

    if (audioConfig.minRepLevel > Math.floor(this.client.currentSubscriber.reputation)) {
      throw new models.WOLFAPIError(`Stage minimum reputation level is ${audioConfig.minRepLevel}`, { targetGroupId, minRepLevel: audioConfig.minRepLevel, botRepLevel: Math.floor(this.client.currentSubscriber.reputation) });
    }

    const slots = this.list(targetGroupId);

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('Bot already occupies a slot in this Group', { targetGroupId, slot: slots.find((slot) => slot.occupierId === this.client.currentSubscriber.id) });
    }

    if (slots.every((slot) => !!slot.occupierId)) {
      throw new models.WOLFAPIError('All slots in group are occupied', { targetGroupId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (slot.reservedOccupierId && slot.reservedOccupierId !== this.client.currentSubscriber.id) {
      throw new models.WOLFAPIError('Slot is reserved for another user', { targetGroupId, slotId });
    }

    if (!sdp) {
      // TODO: create client
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST,
      {
        id: parseInt(targetGroupId),
        slotId: parseInt(slotId),
        sdp
      }
    );
  }

  async consume (targetGroupId, slotId) {
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

    const group = await this.client.group.getById(targetGroupId);
    const audioConfig = group.audioConfig;

    if (!audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is not enabled for Group', { targetGroupId });
    }

    const slot = await this.get(targetGroupId, slotId);

    if (!slot.occupierId) {
      throw new models.WOLFAPIError('Slot is not occupied', { targetGroupId, slotId });
    }
    // TODO: check for client
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

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_BROADCAST_DISCONNECT,
      {
        id: parseInt(targetGroupId),
        slotId: slot.id,
        occupierId: this.client.currentSubscriber.id
      }
    );
  }
}

export { Slot };
