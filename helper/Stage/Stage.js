const Helper = require('../Helper');
const validator = require('../../utils/validator');

const Client = require('./Client');

const { request, internal } = require('../../constants');

const commandExists = require('command-exists-promise');
// eslint-disable-next-line no-unused-vars
const Stream = require('stream');

let _ffmpegExists = false;

module.exports = class Stage extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);

    this._stages = [];

    this._groupStages = {};

    this._slots = {};

    this._clients = [];

    api.on.groupAudioSlotUpdate(async (data) => {
      const targetGroupId = data.id;

      const client = await this._getClient(targetGroupId);

      if (client) {
        const slot = data.slot;

        if (client._slotId !== slot.id) {
          return Promise.resolve();
        }

        return await client.handleSlotUpdate(slot, data.sourceSubscriberId);
      }

      return Promise.resolve();
    });

    api.on.groupAudioCountUpdate(async (data) => {
      const targetGroupId = data.id;

      const client = await this._getClient(targetGroupId);

      if (client) {
        return this._api.on._emit(internal.STAGE_CLIENT_VIEWER_COUNT_CHANGED,
          {
            targetGroupId: targetGroupId,
            count: data.audioCounts.consumerCount
          });
      }

      return Promise.resolve();
    });
  }

  // #region stageHandling

  async _getClient (targetGroupId, create = false) {
    const getClient = () => {
      let client = this._clients.find((client) => client.targetGroupId === targetGroupId);

      if (client || !create) {
        return client;
      }

      client = new Client();

      client.onEnd(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_BROADCAST_ENDED, data);
      });

      client.onDuration(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_DURATION_UPDATE, data);
      });

      client.onStop(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_STOPPED, data);
      });

      client.onError(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_ERROR, data);
      });

      client.onConnecting(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_CONNECTING, data);
      });

      client.onConnected(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_CONNECTED, data);
      });

      client.onKicked(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_KICKED, data);

        this._clients = this._clients.filter((client) => client.targetGroupId !== targetGroupId);
      });

      client.onMuted(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_MUTED, data);
      });

      client.onDisconnected(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_DISCONNECTED, data);

        this._clients = this._clients.filter((client) => client.targetGroupId !== targetGroupId);
      });

      client.onReady(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_READY, data);
      });

      client.onPaused(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_PAUSED, data);
      });

      client.onResume(async (data) => {
        data.targetGroupId = targetGroupId;

        this._api.on._emit(internal.STAGE_CLIENT_UNPAUSED, data);
      });

      client.targetGroupId = targetGroupId;

      this._clients.push(client);

      return getClient(targetGroupId);
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
  * @param {Number} targetGroupId - The id of the group
  * @param {Boolean} requestNew - Whether or not the bot should request new data
  */
  async getSettings (targetGroupId, requestNew = false) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    return (await this._api.group().getById(targetGroupId, requestNew)).audioConfig;
  }

  /**
  * Get list of stages available
  * @param {Boolean} requestNew - Request new data from the server
  */
  async getStages (requestNew = false) {
    if (!requestNew && this._stages.stageCache) {
      return this._stages.stageCache;
    }

    const result = await this._websocket.emit(request.STAGE_LIST);

    if (result.success) {
      this._stages.stageCache = result.body;
    }

    return this._stages.stageCache || [];
  }

  /**
  * Get list of stages available for a specific group
  * @param {Number} targetGroupId - The id of the group
  * @param {Boolean} requestNew - Request new data from the server
  */
  async getStagesForGroup (targetGroupId, requestNew = false) {
    if (!requestNew && this._groupStages[targetGroupId]) {
      return this._groupStages[targetGroupId];
    }

    const result = await this._websocket.emit(request.STAGE_GROUP_ACTIVE_LIST,
      {
        id: targetGroupId
      });

    if (result.success) {
      this._groupStages[targetGroupId] = result.body;
    }

    return this._groupStages[targetGroupId] || [];
  }

  /**
  * Get stage slots for a group
  * @param {Number} targetGroupId - The id of the group
  * @param {Boolean} requestNew - Request new data from the server
  */
  async getSlots (targetGroupId, requestNew = false) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!requestNew && this._slots[targetGroupId]) {
      return this._slots[targetGroupId];
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this._websocket.emit(request.GROUP_AUDIO_SLOT_LIST, {
      id: targetGroupId,
      subscribe: true
    });

    if (slots.success) {
      this._slots[targetGroupId] = slots.body;
    }

    return this._slots[targetGroupId] || [];
  }

  /**
  * Update the mute state of a specific slotroup
  * @param {Number} targetGroupId - The id of the group
  * @param {Number} slotId - The ID of the slot to update
  * @param {Boolean} muted - Whether or not the slot is muted
  */
  async updateSlotMuteState (targetGroupId, slotId, muted) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(slotId)) {
      throw new Error('slotId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new Error('slotId cannot be less than or equal to 0');
    }

    if (!validator.isValidBoolean(muted)) {
      throw new Error('muted must be a valid boolean');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this.getSlots(targetGroupId);

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
        id: targetGroupId,
        slotId,
        occupierId: slot.occupierId,
        occupierMuted: muted
      });
  }

  /**
  * Update the lock state of a specific slot
  * @param {Number} targetGroupId - The id of the group
  * @param {Number} slotId - The ID of the slot to update
  * @param {Boolean} locked - Whether or not the slot is locked
  */
  async updateSlotLockState (targetGroupId, slotId, locked) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(slotId)) {
      throw new Error('slotId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new Error('slotId cannot be less than or equal to 0');
    }

    if (!validator.isValidBoolean(locked)) {
      throw new Error('locked must be a valid boolean');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this.getSlots(targetGroupId);

    if (slots.length === 0) {
      throw new Error('unable to retrieve slots');
    }

    const slot = slots.find((slot) => slot.id === slotId);

    if (!slot) {
      throw new Error('unable to locate slot with this id');
    }

    return await this._websocket.emit(request.GROUP_AUDIO_SLOT_UPDATE, {
      id: targetGroupId,
      slot: {
        id: slotId,
        locked
      }
    });
  }

  /**
  * Leave a slot
  * @param {Number} targetGroupId - The id of the group
  */
  async leaveSlot (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this.getSlots(targetGroupId);

    if (slots.length === 0) {
      throw new Error('unable to retrieve slots');
    }

    const slot = slots.find((slot) => slot.occupierId && slot.occupierId === this._api.currentSubscriber.id);

    if (!slot) {
      throw new Error('bot does not occupy a slot in this group');
    }

    const client = await this._getClient(targetGroupId);

    if (client) {
      this._clients = this._clients.filter((client) => client.targetGroupId !== targetGroupId);

      return await client.disconnect();
    }

    return await this._websocket.emit(request.GROUP_AUDIO_BROADCAST_DISCONNECT, {
      id: targetGroupId,
      slotId: slot.id,
      occupierId: this._api.currentSubscriber.id
    });
  }

  /**
  * Kick a slot
  * @param {Number} targetGroupId - The id of the group
  * @param {Number} slotId - The id of the slot
  */
  async removeSubscriberFromSlot (targetGroupId, slotId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(slotId)) {
      throw new Error('slotId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new Error('slotId cannot be less than or equal to 0');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this.getSlots(targetGroupId);

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
      id: targetGroupId,
      slotId,
      occupierId: slot.occupierId
    });
  }

  /**
  * Join a stage
  * @param {Number} targetGroupId - The id of a group
  * @param {Number} slotId - The id of the slot
  * @param {String} sdp - Do not include if you want to use the built in stage client
  */
  async joinSlot (targetGroupId, slotId, sdp = undefined) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(slotId)) {
      throw new Error('slotId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new Error('slotId cannot be less than or equal to 0');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    if (settings.minRepLevel > Math.floor(this._api.currentSubscriber.reputation)) {
      throw new Error(`stage is only accessible to users who are level ${settings.minRepLevel} or above`);
    }

    const slots = await this.getSlots(targetGroupId);

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
          id: targetGroupId,
          slotId,
          sdp
        });
    }

    const client = await this._getClient(targetGroupId, true);
    const result = await this.joinSlot(targetGroupId, slotId, await client.createOffer());

    if (result.success) {
      client.setAnswer(result.body.sdp);

      client._slotId = slotId;

      return result.body.slot;
    }

    return result;
  }

  /**
   * Receive data for a slot
   * @param {*} targetGroupId - The id of the group
   * @param {*} slotId - The id of the slot
   * @param {*} sdp - RTC data
   */
  async consumeSlot (targetGroupId, slotId, sdp) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    if (!validator.isValidNumber(slotId)) {
      throw new Error('slotId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(slotId)) {
      throw new Error('slotId cannot be less than or equal to 0');
    }

    if (validator.isNullOrWhitespace(sdp)) {
      throw new Error('sdp cannot be null or empty');
    }

    const settings = await this.getSettings(targetGroupId);

    if (!settings) {
      throw new Error('unable to retrieve stage configuration');
    }

    if (!settings.enabled) {
      throw new Error('stage is disabled for requested group');
    }

    const slots = await this.getSlots(targetGroupId);

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
        id: targetGroupId,
        slotId,
        sdp
      });
  }

  /**
   * Play audio on a group stage
   * @param {Number} targetGroupId - The id of the group to play in
   * @param {Stream.Readable} data - The stream to play
   */
  async play (targetGroupId, data) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(targetGroupId, slotId) to initialize a stage client');
    }

    if (!await client.isReady()) {
      throw new Error('stage client is not ready to broadcast, are you sure it has joined a slot?');
    }

    return await client.broadcast(data);
  }

  /**
   * Pause the current audio in a group
   * @param {Number} targetGroupId - The id of the group to pause
   */
  async pause (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(targetGroupId, slotId) to initialize a stage client');
    }

    return await client.pause();
  }

  /**
   * resume the current audio in a group
   * @param {Number} targetGroupId - The id of the group to resume
   */
  async resume (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(targetGroupId, slotId) to initialize a stage client');
    }

    return await client.resume();
  }

  /**
   * Stops the current audio in a group (Resets, cannot be resumed)
   * @param {Number} targetGroupId - The id of the group to stop
   */
  async stop (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group, use api.stage().joinSlot(targetGroupId, slotId) to initialize a stage client');
    }

    return await client.stop();
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the client has connected to a slot and is ready to broadcast
  */
  async isReady (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return await client.isReady();
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the clients broadcast has been paused
  */
  async isPaused (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return client._paused;
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the client has been muted on stage
  */
  async isMuted (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return client._muted;
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the client is broadcasting data
  */
  async isPlaying (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }
    return client._playing;
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the client has connected to a slot
  */
  async isConnected (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return await client.isConnected();
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Boolean} Whether or not the client is currently in the process of connecting
  */
  async isConnecting (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return await client.isConnecting();
  }

  /**
  * @param {Number} targetGroupId - The id of the group
  * @returns {Number} How many seconds of audio have been broadcasted
  */
  async duration (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    const client = await this._getClient(targetGroupId);

    if (!client) {
      throw new Error('stage client does not exist for group');
    }

    return client._duration / 1000;
  }

  /**
  * Check to see if a group has a stage client
  * @param {Number} targetGroupId - the ID of the group to check
  */
  async hasClient (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    return await this._getClient(targetGroupId) !== undefined;
  }

  /**
  * Retrieve the slot the bot is connected to in a group
  * @param {Number} targetGroupId - the ID of the group to check
  */
  async slotId (targetGroupId) {
    if (!validator.isValidNumber(targetGroupId)) {
      throw new Error('targetGroupId must be a valid number');
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new Error('targetGroupId cannot be less than or equal to 0');
    }

    return await this._getClient(targetGroupId)._slotId;
  }

  _process (data) {
    if (this._slots[data.id]) {
      this._slots[data.id][data.slot.id - 1] = data.slot;
    }

    return data;
  }

  _clearCache (clearClients = false) {
    this._stages = [];
    this._slots = {};

    if (clearClients) {
      for (const client of this._clients) {
        client.disconnect();
      }
    }
  }
};
