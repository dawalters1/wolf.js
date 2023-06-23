import WOLFAPIError from '../../models/WOLFAPIError.js';
import Base from '../Base.js';
import Request from './Request.js';
import Slot from './Slot.js';
import StageClient from '../../client/stage/Client.js';
import { Command, Event, StageBroadcastState, StageConnectionState } from '../../constants/index.js';
import validator from '../../validator/index.js';
import models, { StageClientDurationUpdate, StageClientGeneralUpdate, StageClientViewerCountUpdate } from '../../models/index.js';
import commandExists from 'command-exists-promise';

class Stage extends Base {
  constructor (client) {
    super(client);

    this.request = new Request(this.client);
    this.slot = new Slot(this.client);

    this.clients = {};

    this.client.on('groupAudioCountUpdate', (oldCount, newCount) => {
      if (!this.clients[newCount.id]) {
        return Promise.resolve();
      }

      return this.client.emit(
        Event.STAGE_CLIENT_VIEWER_COUNT_CHANGED,
        new StageClientViewerCountUpdate(
          this.client,
          {
            targetGroupId: oldCount.id,
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

      if (client && client.slotId === newSlot.slot.id) {
        return client.handleSlotUpdate(newSlot.slot, newSlot.sourceSubscriberId);
      }

      return Promise.resolve();
    });
  }

  async _getClient (targetGroupId, createIfNotExists = false) {
    if (this.clients[targetGroupId]) {
      return this.clients[targetGroupId];
    }

    if (!await commandExists('ffmpeg')) {
      throw new WOLFAPIError('ffmpeg must be installed on this device to create or use a stage client', { download: 'https://ffmpeg.org/download.html' });
    }

    if (createIfNotExists) {
      const client = new StageClient();

      client.on(Event.STAGE_CLIENT_CONNECTING, (data) => this.client.emit(Event.STAGE_CLIENT_CONNECTING, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_CONNECTED, (data) => this.client.emit(Event.STAGE_CLIENT_CONNECTED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_DISCONNECTED, async (data) => {
        this._deleteClient(targetGroupId);
        this.client.emit(Event.STAGE_CLIENT_DISCONNECTED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId }));
      });
      client.on(Event.STAGE_CLIENT_KICKED, async (data) => {
        this._deleteClient(targetGroupId);
        this.client.emit(Event.STAGE_CLIENT_KICKED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId }));
      });
      client.on(Event.READY, (data) => this.client.emit(Event.READY, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_ERROR, (data) => this.client.emit(Event.STAGE_CLIENT_ERROR, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_END, (data) => this.client.emit(Event.STAGE_CLIENT_END, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_STOPPED, (data) => this.client.emit(Event.STAGE_CLIENT_STOPPED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_MUTED, (data) => this.client.emit(Event.STAGE_CLIENT_MUTED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_UNMUTED, (data) => this.client.emit(Event.STAGE_CLIENT_UNMUTED, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_START, (data) => this.client.emit(Event.STAGE_CLIENT_START, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_READY, (data) => this.client.emit(Event.STAGE_CLIENT_READY, new StageClientGeneralUpdate(this.client, { ...data, targetGroupId })));
      client.on(Event.STAGE_CLIENT_DURATION, (data) => this.client.emit(Event.STAGE_CLIENT_DURATION, new StageClientDurationUpdate(this.client, { ...data, targetGroupId })));

      this.clients[targetGroupId] = client;
    }

    return this.clients[targetGroupId];
  }

  _deleteClient (targetGroupId) {
    this.clients[targetGroupId]?.stop();

    Reflect.deleteProperty(this.clients, targetGroupId);
  }

  async getAudioConfig (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Channel does not exist', { targetGroupId });
    }

    return channel.audioConfig;
  }

  async updateAudioConfig (targetGroupId, { stageId, enabled, minRepLevel }) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
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

    const audioConfig = await this.client.channel.getById(targetGroupId);

    return await this.client.websocket.emit(
      Command.GROUP_AUDIO_UPDATE,
      {
        id: parseInt(targetGroupId),
        stageId: parseInt(stageId) || audioConfig.stageId,
        enabled: enabled || audioConfig.enabled,
        minRepLevel: parseInt(minRepLevel) || audioConfig.minRepLevel
      }
    );
  }

  async getAudioCount (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    const channel = await this.client.channel.getById(targetGroupId);

    if (!channel.exists) {
      throw new models.WOLFAPIError('Channel does not exist', { targetGroupId });
    }

    return channel.audioCounts;
  }

  async play (targetGroupId, data) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].play(data);
  }

  async stop (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].stop();
  }

  async pause (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].pause();
  }

  async resume (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].resume();
  }

  async getBroadcastState (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].broadcastState;
  }

  async onStage (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    return !!this.clients[targetGroupId];
  }

  async isReady (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].connectionState === StageConnectionState.READY;
  }

  async isPlaying (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    return await this.getBroadcastState(targetGroupId) === StageBroadcastState.PLAYING;
  }

  async isPaused (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    return await this.getBroadcastState(targetGroupId) === StageBroadcastState.PAUSED;
  }

  async isIdle (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    return await this.getBroadcastState(targetGroupId) === StageBroadcastState.IDLE;
  }

  async duration (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].duration;
  }

  async getVolume (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].volume;
  }

  async setVolume (targetGroupId, volume) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    if (validator.isNullOrUndefined(volume)) {
      throw new models.WOLFAPIError('volume cannot be null or undefined', { volume });
    } else if (!validator.isValidNumber(volume, true)) {
      throw new models.WOLFAPIError('volume must be a valid number', { volume });
    } else if (validator.isLessThanZero(volume)) {
      throw new models.WOLFAPIError('volume cannot be less than 0', { volume });
    }

    return await this.clients[targetGroupId].setVolume(volume);
  }

  async getSlotId (targetGroupId) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be null or undefined', { targetGroupId });
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId must be a valid number', { targetGroupId });
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new models.WOLFAPIError('targetGroupId cannot be less than or equal to 0', { targetGroupId });
    }

    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].slotId;
  }

  _cleanUp (reconnection = false) {
    if (reconnection) {
      return Promise.resolve();
    }

    Object.keys(this.clients).forEach((targetGroupId) => this._deleteClient(targetGroupId));
    this.request._cleanUp(reconnection);
    this.slot._cleanUp(reconnection);
  }
}

export default Stage;
