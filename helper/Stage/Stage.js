const Helper = require('../Helper');

const Client = require('./Client');

const { request, internal } = require('../../constants');
const validator = require('@dawalters1/validator');

const commandExists = require('command-exists-promise');
// eslint-disable-next-line no-unused-vars
const Stream = require('stream');

let _ffmpegExists = false;

module.exports = class Stage extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._stages = [];

    this._slots = {};

    this._clients = {};

    api.on.groupAudioSlotUpdate(async (data) => {
      const groupId = data.id;

      const client = this._clients[groupId];

      if (client) {
        const slot = data.slot;

        if (client._slotId !== slot.id) {
          return Promise.resolve();
        }

        return await client._handleSlotUpdate(slot);
      }

      return Promise.resolve();
    });

    api.on.groupAudioCountUpdate(async (data) => {
      const client = this._clients[data.id];

      if (client) {
        return this._api.on._emit(internal.STAGE_CLIENT_VIEWER_COUNT_CHANGED, data.audioCounts.consumerCount);
      }

      return Promise.resolve();
    });
  }

  // #region stageHandling

  async _getClient (groupId, create = false) {
    const getClient = () => {
      if (this._clients[groupId] || !create) {
        return this._clients[groupId];
      }

      this._clients[groupId] = new Client(this._api, groupId);

      return getClient(groupId);
    };

    try {
      if (_ffmpegExists || await commandExists('ffmpeg')) {
        _ffmpegExists = true;

        return getClient();
      }

      const exists = await commandExists('ffmpeg');

      if (exists) {
        _ffmpegExists = true;
        return getClient();
      }

      throw new Error('ffmpeg must be installed on this device');
    } catch (error) {
      throw console.error();
    }
  }

  // #endregion

  /**
  * Retrieve group stage settings
  * @param {Number} groupId - The id of the group
  * @param {Boolean} requestNew - Whether or not the bot should request new data
  */
  async getSettings (groupId, requestNew = false) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      return (await this._api.group().getById(groupId, requestNew)).audioConfig;
    } catch (error) {
      error.method = `Helper/Stage/getSettings(groupId =${JSON.stringify(groupId)}, requestNew = ${JSON.stringify(requestNew)})`;
      throw error;
    }
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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new Error('unable to locate slot with this id');
      }

      if (slot.occupierId !== this._api.currentSubscriber.id && !muted) {
        throw new Error('occupierId must be self');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_UPDATE,
        {
          id: groupId,
          slotId,
          occupierId: slot.occupierId,
          occupierMuted: muted
        });
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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new Error('unable to locate slot with this id');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_SLOT_UPDATE, {
        id: groupId,
        slot: {
          id: slotId,
          locked
        }
      });
    } catch (error) {
      error.method = `Helper/Stage/updateSlotLockState(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)}, locked = ${JSON.stringify(locked)})`;

      throw error;
    }
  }

  /**
  * Leave a slot
  * @param {Number} groupId - The id of the group
  */
  async leaveSlot (groupId) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.occupierId && slot.occupierId === this._api.currentSubscriber.id);

      if (!slot) {
        throw new Error('bot does not occupy a slot in this group');
      }

      const client = await this._getClient(groupId);

      if (client) {
        this._clients[groupId] = undefined;

        return await client.leaveSlot();
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
        id: groupId,
        slotId: slot.id,
        occupierId: this._api.currentSubscriber.id
      });
    } catch (error) {
      error.method = `Helper/Stage/leaveSlot(groupId = ${JSON.stringify(groupId)})`;

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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new Error('unable to locate slot with this id');
      }

      if (!slot.occupierId) {
        throw new Error('no subscriber occupies slot');
      }

      return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
        id: groupId,
        slotId,
        occupierId: slot.occupierId
      });
    } catch (error) {
      error.method = `Helper/Stage/removeSubscriberFromSlot(groupId = ${JSON.stringify(groupId)}, slotId = ${JSON.stringify(slotId)})`;

      throw error;
    }
  }

  /**
  * Join a stage
  * @param {Number} groupId - The id of a group
  * @param {Number} slotId - The id of the slot
  * @param {String} sdp - Do not include if you want to use the built in stage client
  */
  async joinSlot (groupId, slotId, sdp = undefined) {
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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new Error('unable to locate slot with this id');
      }

      if (slot.occupierId) {
        throw new Error('a subscriber already occupies this slot');
      }

      // If sdp exists, assume they are using a personal rtc
      if (sdp) {
        return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST,
          {
            id: this._groupId,
            slotId,
            sdp
          });
      }

      return await (await this._getClient(groupId, true)).joinSlot(slotId);
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

      const settings = await this.getSettings(groupId);

      if (!settings) {
        throw new Error('unable to retrieve stage configuration');
      }

      if (!settings.enabled) {
        throw new Error('stage is disabled for requested group');
      }

      const slots = await this.getSlots(groupId);

      if (slots.length === 0) {
        throw new Error('unable to retrieve slots');
      }

      const slot = slots.find((slot) => slot.id === slotId);

      if (!slot) {
        throw new Error('unable to locate slot with this id');
      }

      if (!slot.occupierId) {
        throw new Error('no subscriber occupies slot');
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

  /**
   * Play audio on a group stage
   * @param {Number} groupId - The id of the group to play in
   * @param {Stream.Readable} data - The stream to play
   */
  async play (groupId, data) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(groupId, slotId) to initialize a stage client');
    }

    if (!client._ready) {
      throw new Error('stage client is not ready to broadcast, are you sure it has joined a slot?');
    }

    return await client.play(data);
  }

  /**
   * Pause the current audio in a group
   * @param {Number} groupId - The id of the group to pause
   */
  async pause (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(groupId, slotId) to initialize a stage client');
    }

    return await client.pause();
  }

  /**
   * Unpause the current audio in a group
   * @param {Number} groupId - The id of the group to unpause
   */
  async unpause (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(groupId, slotId) to initialize a stage client');
    }

    return await client.unpause();
  }

  /**
   * Stops the current audio in a group (Resets, cannot be resumed)
   * @param {Number} groupId - The id of the group to stop
   */
  async stop (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(groupId, slotId) to initialize a stage client');
    }

    return await client.stop();
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the client has connected to a slot and is ready to broadcast
  */
  async isReady (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._ready;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the clients broadcast has been paused
  */
  async isPaused (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._paused;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the client has been muted on stage
  */
  async isMuted (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._muted;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the client is broadcasting data
  */
  async isPlaying (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._playing;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the client has connected to a slot
  */
  async isConnected (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._slotId !== 0;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Boolean} Whether or not the client is currently in the process of connecting
  */
  async isConnecting (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._isConnecting;
  }

  /**
  * @param {Number} groupId - The id of the group
  * @returns {Number} How many seconds of audio have been broadcasted
  */
  async duration (groupId) {
    const client = await this._getClient(groupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return client._duration / 1000;
  }

  async hasClient (groupId) {
    return await this._getClient(groupId) !== undefined;
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
