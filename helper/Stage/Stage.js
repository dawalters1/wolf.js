const Helper = require('../Helper');

const request = require('../../constants/request');
const validator = require('@dawalters1/validator');

module.exports = class Stage extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);

    this._cache = {};

    this._slots = {};
  }

  async getStages (requestNew = false) {
    try {
      if (!requestNew && this._cache.stageCache) {
        return this._cache.stageCache;
      }

      const result = await this._websocket.emit(request.STAGE_LIST);

      if (result.success) {
        this._cache.stageCache = result.body;
      }

      return this._cache.stageCache || [];
    } catch (error) {
      error.method = `Helper/Stage/getStages(requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async getSlots (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!requestNew && this._slots[groupId]) {
        return this._slots[groupId];
      }

      const slots = await this._websocket.emit(request.GROUP_AUDIO_SLOT_LIST, {
        id: groupId,
        subscribe: true
      });

      if (slots.success) {
        this._slots[groupId] = slots.body;
      }

      return this._slots[groupId] || [];
    } catch (error) {
      error.method = `Helper/Stage/getSlots(groupId =${JSON.stringify(groupId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  async updateSlot (groupId, slot) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (slot) {
        if (!validator.isValidNumber(slot.id)) {
          throw new Error('id must be a valid number');
        } else if (validator.isLessThanOrEqualZero(slot.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }

        if (slot.locked && !validator.isValidBoolean(slot.locked)) {
          throw new Error('locked must be a valid boolean');
        }
      } else {
        throw new Error('slot cannot be null or empty');
      }

      const result = await this._websocket.emit(request.GROUP_AUDIO_SLOT_UPDATE, slot);

      if (result.success && this._slots[groupId]) {
        this._slots[groupId][result.slot.id - 1] = result.slot;
      }

      return result;
    } catch (error) {
      error.method = `Helper/Stage/updateSlot(groupId = ${JSON.stringify(groupId)}, slot = ${JSON.stringify(slot)})`;
      throw error;
    }
  }

  async broadcastUpdate (groupId, slot) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (slot) {
        slot.id = groupId;

        if (!validator.isValidNumber(slot.slotId)) {
          throw new Error('slotId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(slot.slotId)) {
          throw new Error('slotId cannot be less than or equal to 0');
        }
        if (!validator.isValidNumber(slot.occupierId)) {
          throw new Error('occupierId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(slot.occupierId)) {
          throw new Error('occupierId cannot be less than or equal to 0');
        }
        if (!validator.isValidBoolean(slot.occupireMuted)) {
          throw new Error('locked must be a valid boolean');
        }
      } else {
        throw new Error('slot cannot be null or empty');
      }

      const result = await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_UPDATE, slot);

      if (result.success && this._slots[groupId]) {
        this._slots[groupId][result.slot.id - 1] = result.slot;
      }

      return result;
    } catch (error) {
      error.method = `Helper/Stage/broadcastUpdate(groupId = ${JSON.stringify(groupId)}, slot = ${JSON.stringify(slot)})`;

      throw error;
    }
  }

  async broadcastDisconnect (groupId, slotId, sourceSubscriberId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(slotId)) {
        throw new Error('slotId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new Error('slotId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(sourceSubscriberId)) {
        throw new Error('sourceSubscriberId cannot be less than or equal to 0');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
        id: groupId,
        slotId,
        occupierId: sourceSubscriberId
      });
    } catch (error) {
      error.method = `Helper/Stage/broadcastDisconnect(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, sourceSubscriberId = ${JSON.stringify(sourceSubscriberId)})`;

      throw error;
    }
  }

  async broadcast (groupId, slotId, sdp) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(slotId)) {
        throw new Error('slotId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new Error('slotId cannot be less than or equal to 0');
      }

      if (!validator.isNullOrWhitespace(sdp)) {
        throw new Error('sdp cannot be null or empty');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST,
        {
          id: groupId,
          slotId,
          sdp
        });
    } catch (error) {
      error.method = `Helper/Stage/broadcast(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, sdp = ${JSON.stringify(sdp)})`;

      throw error;
    }
  }

  async consume (groupId, slotId, sdp) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(slotId)) {
        throw new Error('slotId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(slotId)) {
        throw new Error('slotId cannot be less than or equal to 0');
      }

      if (!validator.isNullOrWhitespace(sdp)) {
        throw new Error('sdp cannot be null or empty');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_CONSUME,
        {
          id: groupId,
          slotId,
          sdp
        });
    } catch (error) {
      error.method = `Helper/Stage/consume(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, sdp = ${JSON.stringify(sdp)})`;

      throw error;
    }
  }

  _process (data) {
    if (this._slots[data.id]) {
      this._slots[data.id][data.slot.id - 1] = data.slot;
    }

    return data;
  }

  _cleanUp () {
    this._slots = {};
    this._cache = {};
  }
};
