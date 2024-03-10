import WOLFAPIError from '../../models/WOLFAPIError.js';
import Base from '../Base.js';
import Request from './Request.js';
import Slot from './Slot.js';
import StageClient from '../../client/stage/Client.js';
import { Command, Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models, { StageClientDurationUpdate, StageClientGeneralUpdate, StageClientViewerCountUpdate } from '../../models/index.js';
import commandExists from 'command-exists-promise';

// Cancer
class Stage extends Base {
  constructor (client) {
    super(client);

    this.request = new Request(this.client);
    this.slot = new Slot(this.client);

    this.clients = {};

    this.client.on('groupAudioCountUpdate', (oldCount, newCount) => {
      if (!this.clients[newCount.id]) { return false; }

      return this.client.emit(
        Event.STAGE_CLIENT_VIEWER_COUNT_CHANGED,
        new StageClientViewerCountUpdate(
          this.client,
          {
            targetChannelId: oldCount.id,
            slotId: this.clients[oldCount.id]?.slotId ?? 0,
            oldBroadcastCount: oldCount.broadcasterCount,
            newBroadcasterCount: newCount.broadcasterCount,
            oldConsumerCount: oldCount.consumerCount,
            newConsumerCount: newCount.consumerCount
          }
        )
      );
    });

    this.client.on('groupAudioSlotUpdate', (oldSlot, newSlot) => {
      const client = this.clients[newSlot.id];

      if (client?.slotId !== newSlot.slot.id) { return false; }

      return client.handleSlotUpdate(newSlot.slot, newSlot.sourceSubscriberId);
    });
  }

  async _getClient (targetChannelId, createIfNotExists = false) {
    if (this.clients[targetChannelId]) {
      return this.clients[targetChannelId];
    }

    if (!await commandExists('ffmpeg')) {
      throw new WOLFAPIError('ffmpeg must be installed on this device to create or use a stage client', { download: 'https://ffmpeg.org/download.html' });
    }

    if (createIfNotExists) {
      const client = new StageClient();

      client.on(Event.STAGE_CLIENT_CONNECTING, (data) => this.client.emit(Event.STAGE_CLIENT_CONNECTING, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_CONNECTED, (data) => this.client.emit(Event.STAGE_CLIENT_CONNECTED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_DISCONNECTED, async (data) => {
        this._deleteClient(targetChannelId);
        this.client.emit(Event.STAGE_CLIENT_DISCONNECTED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId }));
      });
      client.on(Event.STAGE_CLIENT_KICKED, async (data) => {
        this._deleteClient(targetChannelId);
        this.client.emit(Event.STAGE_CLIENT_KICKED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId }));
      });
      client.on(Event.READY, (data) => this.client.emit(Event.READY, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_ERROR, (data) => this.client.emit(Event.STAGE_CLIENT_ERROR, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_END, (data) => this.client.emit(Event.STAGE_CLIENT_END, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_STOPPED, (data) => this.client.emit(Event.STAGE_CLIENT_STOPPED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_MUTED, (data) => this.client.emit(Event.STAGE_CLIENT_MUTED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_UNMUTED, (data) => this.client.emit(Event.STAGE_CLIENT_UNMUTED, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_START, (data) => this.client.emit(Event.STAGE_CLIENT_START, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_READY, (data) => this.client.emit(Event.STAGE_CLIENT_READY, new StageClientGeneralUpdate(this.client, { ...data, targetChannelId })));
      client.on(Event.STAGE_CLIENT_DURATION, (data) => this.client.emit(Event.STAGE_CLIENT_DURATION, new StageClientDurationUpdate(this.client, { ...data, targetChannelId })));

      this.clients[targetChannelId] = client;
    }

    return this.clients[targetChannelId];
  }

  _deleteClient (targetChannelId) {
    this.clients[targetChannelId]?.stop();

    Reflect.deleteProperty(this.clients, targetChannelId);
  }

  /**
   * Gets all stages available for a channel
   * @param {Number} targetChannelId
   * @returns {Promise<Array<ChannelStage>>}
   */
  async getAvailableStages (targetChannelId, forceNew = false) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Channel does not exist', { targetChannelId });
    }

    if (!forceNew && channel._stages) {
      channel.stages = channel.stages.filter((stage) => !stage.expireTime || new Date(stage.expireTime) > Date.now()) ?? [];

      return channel.stages;
    }

    const result = await this.client.websocket.emit(
      Command.STAGE_GROUP_ACTIVE_LIST,
      {
        id: parseInt(targetChannelId)
      }
    );

    channel._stages = result?.body?.map((stage) => new models.ChannelStage(this.client, stage, parseInt(targetChannelId))) ?? [];

    return channel._stages;
  }

  /**
   * Get a channels stage settings
   * @param {Number} targetChannelId
   * @returns {Promise<ChannelAudioConfig>}
   */
  async getAudioConfig (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Channel does not exist', { targetChannelId });
    }

    return channel.audioConfig;
  }

  /**
   * Update the channels audio config
   * @param {Number} targetChannelId
   * @param {Number} stageId
   * @param {Boolean} enabled
   * @param {Number} minRepLevel
   * @returns {Promise<Response>}
   */
  async updateAudioConfig (targetChannelId, { stageId, enabled, minRepLevel }) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (stageId) {
      if (!validator.isValidNumber(stageId)) {
        throw new models.WOLFAPIError('stageId must be a valid number', { stageId });
      } else if (validator.isLessThanZero(stageId)) {
        throw new models.WOLFAPIError('stageId cannot be less than 0', { stageId });
      }
    }

    if (enabled && !validator.isValidBoolean(enabled)) {
      throw new models.WOLFAPIError('enabled must be a valid boolean', { enabled });
    }

    if (minRepLevel) {
      if (!validator.isValidNumber(minRepLevel)) {
        throw new models.WOLFAPIError('minRepLevel must be a valid number', { minRepLevel });
      } else if (validator.isLessThanZero(minRepLevel)) {
        throw new models.WOLFAPIError('minRepLevel cannot be less than 0', { minRepLevel });
      }
    }

    const audioConfig = await this.client.channel.getById(targetChannelId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_UPDATE,
      {
        id: parseInt(targetChannelId),
        stageId: parseInt(stageId) || audioConfig.stageId,
        enabled: enabled || audioConfig.enabled,
        minRepLevel: parseInt(minRepLevel) || audioConfig.minRepLevel
      }
    );
  }

  /**
   * Get a channels stage settings
   * @param {Number} targetChannelId
   * @returns {Promise<ChannelAudioCounts>}
   */
  async getAudioCount (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    const channel = await this.client.channel.getById(targetChannelId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Channel does not exist', { targetChannelId });
    }

    return channel.audioCounts;
  }

  /**
   * Play audio on stage
   * @param {Number} targetChannelId
   * @param {Stream} data
   * @returns {Promise<void>}
   */
  async play (targetChannelId, data) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].play(data);
  }

  /**
   * Stop playing audio on a stage (Will remain on stage)
   * @param {Number} targetChannelId
   * @returns {Promise<void>}
   */
  async stop (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].stop();
  }

  /**
   * Pause the current broadcast (Download continues in background)
   * @param {Number} targetChannelId
   * @returns {Promise<void>}
   */
  async pause (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].pause();
  }

  /**
   * Resume the current broadcast
   * @param {Number} targetChannelId
   * @returns {Promise<void>}
   */
  async resume (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].resume();
  }

  /**
   * Whether or not the bot is on stage
   * @param {Number} targetChannelId
   * @returns {Promise<boolean>}
   */
  async onStage (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    return !!this.clients[targetChannelId];
  }

  /**
   * Get the current broadcast state of the client for a channel
   * @param {Number} targetChannelId
   * @returns {Promise<StageBroadcastState>}
   */
  async getBroadcastState (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].broadcastState;
  }

  /**
   * Whether or not the client for the channel is ready to broadcast
   * @param {Number} targetChannelId
   * @returns {Promise<boolean>}
   */
  async isReady (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].connectionState === StageConnectionState.READY;
  }

  /**
   * Whether or not the client for the channel is broadcasting
   * @param {Number} targetChannelId
   * @returns {Promise<boolean>}
   */
  async isPlaying (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    return await this.getBroadcastState(targetChannelId) === StageBroadcastState.PLAYING;
  }

  /**
   * Whether or not the client for the channel is paused
   * @param {Number} targetChannelId
   * @returns {Promise<boolean>}
   */
  async isPaused (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    return await this.getBroadcastState(targetChannelId) === StageBroadcastState.PAUSED;
  }

  /**
   * Whether or not the client for the channel is idling
   * @param {Number} targetChannelId
   * @returns {Promise<boolean>}
   */
  async isIdle (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    return await this.getBroadcastState(targetChannelId) === StageBroadcastState.IDLE;
  }

  /**
   * Get the duration of the current broadcast
   * @param {Number} targetChannelId
   * @returns {Promise<Number>}
   */
  async duration (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].duration;
  }

  /**
   * Get the volume of the current broadcast
   * @param {Number} targetChannelId
   * @returns {Promise<number>}
   */
  async getVolume (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].volume;
  }

  /**
   * Change the volume of the current broadcast (Causes static :()
   * @param {Number} targetChannelId
   * @param {Number} volume
   * @returns {Promise<void>}
   */
  async setVolume (targetChannelId, volume) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    if (validator.isNullOrUndefined(volume)) {
      throw new models.WOLFAPIError('volume cannot be null or undefined', { volume });
    } else if (!validator.isValidNumber(volume, true)) {
      throw new models.WOLFAPIError('volume must be a valid number', { volume });
    } else if (validator.isLessThanZero(volume)) {
      throw new models.WOLFAPIError('volume cannot be less than 0', { volume });
    }

    return await this.clients[targetChannelId].setVolume(volume);
  }

  /**
   * Get the slot the bot is on
   * @param {Number} targetChannelId
   * @returns {Promise<Number>}
   */
  async getSlotId (targetChannelId) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (!this.clients[targetChannelId]) {
      throw new WOLFAPIError('bot is not on stage', { targetChannelId });
    }

    return await this.clients[targetChannelId].slotId;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) { return false; }

    Object.keys(this.clients)
      .map((targetChannelId) =>
        this._deleteClient(targetChannelId)
      );

    this.request._cleanUp(reconnection);
    this.slot._cleanUp(reconnection);
  }
}

export default Stage;
