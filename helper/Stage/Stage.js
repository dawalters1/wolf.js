const Helper = require('../Helper');

const request = require('../../constants/request');
const validator = require('@dawalters1/validator');

module.exports = class Stage extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);

    this._stages = [];

    this._slots = {};
  }

  /**
   * Get list of stages available
   * @param {Boolean} requestNew - Request new data from the server
   */
  async getStages (requestNew = false) {
    try {
      if (!requestNew && this._stages.stageCache) {
        return this._stages.stageCache;
      }

      const result = await this._websocket.emit(request.STAGE_LIST);

      if (result.success) {
        this._stages.stageCache = result.body;
      }

      return this._stages.stageCache || [];
    } catch (error) {
      error.method = `Helper/Stage/getStages(requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
  }

  /**
   * Get stage slots for a group
   * @param {Number} groupId - The id of the group
   * @param {Boolean} requestNew - Request new data from the server
   */
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

  /**
   * Update the mute state of a specific slotroup
   * @param {Number} groupId - The id of the group
   * @param {Number} slotId - The ID of the slot to update
   * @param {Boolean} muted - Whether or not the slot is muted
   */
  async updateSlotMuteState (groupId, slotId, muted) {
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

      if (!validator.isValidBoolean(muted)) {
        throw new Error('muted must be a valid boolean');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length > 0) {
        const slot = slots.find((slot) => slot.id === slotId);

        if (slot) {
          if (slot.occupierId !== this._bot.currentSubscriber.id && !muted) {
            throw new Error('you can only unmute yourself');
          }

          return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_UPDATE,
            {
              id: groupId,
              slotId,
              occupierId: slot.occupierId,
              occupierMuted: muted
            });
        }
        throw new Error('invalid slot id');
      }
      throw new Error('not in group or stage is disabled');
    } catch (error) {
      error.method = `Helper/Stage/updateSlotMuteState(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, muted = ${JSON.stringify(muted)})`;
      throw error;
    }
  }

  /**
   * Update the lock state of a specific slot
   * @param {Number} groupId - The id of the group
   * @param {Number} slotId - The ID of the slot to update
   * @param {Boolean} locked - Whether or not the slot is locked
   */
  async updateSlotLockState (groupId, slotId, locked) {
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

      if (!validator.isValidBoolean(locked)) {
        throw new Error('locked must be a valid boolean');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length > 0) {
        const slot = slots.find((slot) => slot.id === slotId);

        if (slot) {
          const result = await this._websocket.emit(request.GROUP_AUDIO_SLOT_UPDATE, {
            id: groupId,
            slot: {
              id: slotId,
              locked
            }
          });

          return result;
        }
        throw new Error('invalid slot id');
      }
      throw new Error('not in group or stage is disabled');
    } catch (error) {
      error.method = `Helper/Stage/updateSlotLockState(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, locked = ${JSON.stringify(locked)})`;

      throw error;
    }
  }

  /**
   * Leave a slot
   * @param {Number} groupId - The id of the group
   * @param {Number} slotId - The id of the slot
   */
  async leaveSlot (groupId, slotId) {
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

      const slots = await this.getSlots(groupId);

      if (slots.length > 0) {
        const slot = slots.find((slot) => slot.id === slotId);

        if (slot) {
          if (slot.occupierId) {
            if (slot.occupierId !== this._bot.currentSubscriber.id) {
              return this.removeSubscriberFromSlot(groupId, slot.id, slot.occupierId);
            }

            return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
              id: groupId,
              slotId,
              occupierId: this._bot.currentSubscriber.id
            });
          }
          throw new Error('no subscriber occupying slot');
        }
        throw new Error('invalid slot id');
      }
      throw new Error('not in group or stage is disabled');
    } catch (error) {
      error.method = `Helper/Stage/leaveSlot(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)})`;

      throw error;
    }
  }

  /**
   * Kick a slot
   * @param {Number} groupId - The id of the group
   * @param {Number} slotId - The id of the slot
   */
  async removeSubscriberFromSlot (groupId, slotId) {
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
      const slots = await this.getSlots(groupId);

      if (slots.length > 0) {
        const slot = slots.find((slot) => slot.id === slotId);

        if (slot) {
          if (slot.occupierId) {
            return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
              id: groupId,
              slotId,
              occupierId: slot.occupierId
            });
          }
          throw new Error('no subscriber occupying slot');
        }
        throw new Error('invalid slot id');
      }
      throw new Error('not in group or stage is disabled');
    } catch (error) {
      error.method = `Helper/Stage/removeSubscriberFromSlot(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)})`;

      throw error;
    }
  }

  /**
   * Join a stage
   * @param {Number} groupId - The id of a group
   * @param {Number} slotId - The id of the slot
   * @param {String} sdp - RTC data
   */
  async joinSlot (groupId, slotId, sdp) {
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

      if (validator.isNullOrWhitespace(sdp)) {
        throw new Error('sdp cannot be null or empty');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST,
        {
          id: groupId,
          slotId,
          sdp
        });
    } catch (error) {
      error.method = `Helper/Stage/joinSlot(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, sdp = ${JSON.stringify(sdp)})`;

      throw error;
    }
  }

  /**
   * Receive data for a slot
   * @param {*} groupId - The id of the group
   * @param {*} slotId - The id of the slot
   * @param {*} sdp - RTC data
   */
  async consumeSlot (groupId, slotId, sdp) {
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

      if (validator.isNullOrWhitespace(sdp)) {
        throw new Error('sdp cannot be null or empty');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_CONSUME,
        {
          id: groupId,
          slotId,
          sdp
        });
    } catch (error) {
      error.method = `Helper/Stage/consumeSlot(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, sdp = ${JSON.stringify(sdp)})`;

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
    this._stages = [];
    this._slots = {};
  }
};
