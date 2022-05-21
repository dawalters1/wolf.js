const Base = require('../Base');
const WOLFAPIError = require('../../models/WOLFAPIError');
const validator = require('../../validator');
const { Command } = require('../../constants');
const models = require('../../models');

class Request extends Base {
  async list (targetGroupId, forceNew = false) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!validator.isValidBoolean(forceNew)) {
      throw new WOLFAPIError('forceNew must be a valid boolean', { forceNew });
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!forceNew && group._requestListFetched) {
      return group.audioRequests;
    }

    const response = await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_LIST,
      {
        id: targetGroupId,
        subscribe: true
      }
    );

    if (response.success) {
      group._requestListFetched = true;
      group.audioRequests = response.body.map((request) => new models.GroupAudioRequest(this.client, request));
    }

    return group.audioRequests || [];
  }

  async add (targetGroupId, slotId = undefined, subscriberId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (slotId) {
      if (validator.isNullOrUndefined(slotId)) {
        throw new WOLFAPIError('slotId cannot be null or undefined', { slotId });
      } else if (!validator.isValidNumber(slotId)) {
        throw new WOLFAPIError('slotId must be a valid number', { slotId });
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
      }

      if (validator.isNullOrUndefined(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const slots = await group.getStageSlots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new WOLFAPIError('slot does not exist',
          {
            targetGroupId,
            slotId
          }
        );
      }

      if (slot.locked) {
        throw new WOLFAPIError('slot is locked',
          {
            targetGroupId,
            slotId
          }
        );
      }

      if (slots.some((slot) => slot.occupierId === subscriberId)) {
        throw new WOLFAPIError('subscriber already occupies a slot in this group',
          {
            targetGroupId,
            subscriberId
          }
        );
      }

      if (slots.some((slot) => slot.reservedOccupierId === subscriberId)) {
        throw new WOLFAPIError('subscriber already has a slot request in this group',
          {
            targetGroupId,
            subscriberId
          }
        );
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: targetGroupId,
          slotId,
          reservedExpiresAt: Date.now() + 30000,
          reservedOccupierId: subscriberId
        }
      );
    }

    if (slots.some((slot) => slot.occupierId === this.client.currentSubscriber.id)) {
      throw new WOLFAPIError('bot already occupies a slot in this group', { targetGroupId });
    }

    if (slots.some((slot) => slot.reservedOccupierId === this.client.currentSubscriber.id)) {
      throw new WOLFAPIError('bot already has a slot request in this group', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_ADD,
      {
        id: targetGroupId
      }
    );
  }

  async delete (targetGroupId, slotId = undefined) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (slotId) {
      if (validator.isNullOrUndefined(slotId)) {
        throw new WOLFAPIError('slotId cannot be null or undefined', { slotId });
      } else if (!validator.isValidNumber(slotId)) {
        throw new WOLFAPIError('slotId must be a valid number', { slotId });
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new WOLFAPIError('slotId cannot be less than or equal to 0', { slotId });
      }
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const slots = await group.slots();

    if (slotId) {
      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new WOLFAPIError('slot does not exist',
          {
            targetGroupId,
            slotId
          }
        );
      }

      if (slot.locked) {
        throw new WOLFAPIError('slot is locked',
          {
            targetGroupId,
            slotId
          }
        );
      }

      if (slot.occupierId) {
        throw new WOLFAPIError('slot request has already been accepted',
          {
            targetGroupId,
            slotId
          }
        );
      }

      return await this.client.websocket.emit(
        Command.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: targetGroupId,
          slotId,
          reservedExpiresAt: undefined,
          reservedOccupierId: undefined
        }
      );
    }

    const requests = await group.getRequestList();

    if (!requests.some((request) => request.subscriberId === this.client.currentSubscriber.id)) {
      throw new WOLFAPIError('bot is not in the mic request list', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_DELETE,
      {
        id: targetGroupId
      }
    );
  }

  async clear (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new Error('targetGroupId cannot be null or undefined');
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (!validator.isType(targetGroupId, 'number')) {
      throw new Error('targetGroupId must be type of number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const group = await this.client.group.getById(targetGroupId);

    if (!group.exists) {
      throw new WOLFAPIError('No such group', { targetGroupId });
    }

    if (!group.inGroup) {
      throw new WOLFAPIError('Not in group', { targetGroupId });
    }

    if (!group.audioConfig.enabled) {
      throw new WOLFAPIError('Stage is disabled', { targetGroupId });
    }

    const requests = await group.getRequestList();

    if (!requests.length) {
      throw new WOLFAPIError('request list is already empty', { targetGroupId });
    }

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_REQUEST_CLEAR,
      {
        id: targetGroupId
      }
    );
  }
}

module.exports = Request;
