import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command } from '../../constants/index.js';
import models from '../../models/index.js';

class Request extends Base {
  async list (targetGroupId, subscribe = true, forceNew = false) {
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

    if (!validator.isValidBoolean(forceNew)) {
      throw new models.WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!forceNew && group._requestListFetched) {
      return group.audioRequests;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_LIST,
      {
        id: parseInt(targetGroupId),
        subscribe
      }
    );

    if (response.success) {
      group._requestListFetched = true;
      group.audioRequests = response.body.map((request) => new models.GroupAudioSlotRequest(this.client, request));
    }

    return group.audioRequests || [];
  }

  async add (targetGroupId, slotId = undefined, subscriberId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new models.WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const slots = await group.getStageSlots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === parseInt(slotId));

      if (!slot) {
        throw new models.WOLFAPIError('slot does not exist', { targetGroupId, slotId });
      }

      if (slot.locked) {
        throw new models.WOLFAPIError('slot is locked', { targetGroupId, slotId });
      }

      if (slots.some((slot) => slot.occupierId === parseInt(subscriberId))) {
        throw new models.WOLFAPIError('subscriber already occupies a slot in this group', { targetGroupId, subscriberId });
      }

      if (slots.some((slot) => slot.reservedOccupierId === parseInt(subscriberId))) {
        throw new models.WOLFAPIError('subscriber already has a slot request in this group', { targetGroupId, subscriberId });
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: parseInt(targetGroupId),
          slotId: parseInt(slotId),
          reservedExpiresAt: Date.now() + 30000,
          reservedOccupierId: parseInt(subscriberId)
        }
      );
    }

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot already occupies a slot in this group', { targetGroupId });
    }

    if (slots.some((slot) => slot.reservedOccupierId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot already has a slot request in this group', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_ADD,
      {
        id: parseInt(targetGroupId)
      }
    );
  }

  async delete (targetGroupId, slotId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new models.WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const slots = await group.slots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === parseInt(slotId));

      if (!slot) {
        throw new models.WOLFAPIError('slot does not exist', { targetGroupId, slotId });
      }

      if (slot.locked) {
        throw new models.WOLFAPIError('slot is locked', { targetGroupId, slotId });
      }

      if (slot.occupierId) {
        throw new models.WOLFAPIError('slot request has already been accepted', { targetGroupId, slotId });
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: parseInt(targetGroupId),
          slotId: parseInt(slotId),
          reservedExpiresAt: undefined,
          reservedOccupierId: undefined
        }
      );
    }

    const requests = await group.getRequestList();

    if (!requests.some((request) => request.subscriberId === this.client.currentSubscriber.id)) {
      throw new models.WOLFAPIError('bot is not in the mic request list', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_DELETE,
      {
        id: parseInt(targetGroupId)
      }
    );
  }

  async clear (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (!validator.isType(targetGroupId, 'number')) {
      throw new models.WOLFAPIError('targetGroupId must be type of number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new models.WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new models.WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new models.WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const requests = await group.getRequestList();

    if (!requests.length) {
      throw new models.WOLFAPIError('request list is already empty', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_CLEAR,
      {
        id: parseInt(targetGroupId)
      }
    );
  }
}

export default Request;
