const Client = require('../../client/stage/Client');
const { events } = require('../../client/stage/constants');
const { Events } = require('../../constants');

const commandExists = require('command-exists-promise');

class Manager {
  constructor (api) {
    this._api = api;

    this._clients = {};

    this._api.on('groupAudioCountUpdate', (oldCount, newCount) => {
      const client = this._clients[oldCount.id];

      if (client) {
        api.emit(
          Events.STAGE_CLIENT_VIEWER_COUNT_CHANGED,
          {
            targetGroupId: oldCount.id,
            count: newCount.consumerCount
          }
        );
      }

      return Promise.resolve();
    });

    this._api.on('groupAudioSlotUpdate', (oldSlot, newSlot) => {
      const client = this._clients[newSlot.id];

      if (client) {
        if (client._slotId !== newSlot.slot.id) {
          return Promise.resolve();
        }

        client._handleSlotUpdate(newSlot.slot, newSlot.sourceSubscriberId);
      }

      return Promise.resolve();
    });
  }

  async _removeClient (targetGroupId) {
    const client = this._clients[targetGroupId];

    if (client) {
      Reflect.deleteProperty(this._clients, targetGroupId);

      if (client.isConnected) {
        await client.disconnect();
      }
    }

    return Promise.resolve();
  }

  _emit (eventString, targetGroupId, data) {
    const obj = {
      targetGroupId,
      client: this._clients[targetGroupId],
      duration: this._clients[targetGroupId]._duration
    };
    if (data) {
      Object.assign(obj, data);
    }

    return this._api.emit(eventString, obj);
  }

  _initClient (targetGroupId) {
    const client = new Client(targetGroupId);

    client.on(events.CONNECTING, () => this._emit(events.CONNECTING, targetGroupId));
    client.on(events.CONNECTED, () => this._emit(events.CONNECTED, targetGroupId));
    client.on(events.DISCONNECTED, async () => {
      this._clients[targetGroupId].stop();
      Reflect.deleteProperty(this._clients, targetGroupId);
      this._emit(events.DISCONNECTED, targetGroupId);
    });
    client.on(events.KICKED, async () => {
      this._clients[targetGroupId].stop();
      Reflect.deleteProperty(this._clients, targetGroupId);
      this._emit(events.KICKED, targetGroupId);
    });
    client.on(events.READY, () => this._emit(events.READY, targetGroupId));
    client.on(events.BROADCAST_ERROR, (err) => this._emit(events.BROADCAST_ERROR, targetGroupId, { error: err }));
    client.on(events.BROADCAST_END, () => this._emit(events.BROADCAST_END, targetGroupId));
    client.on(events.BROADCAST_PAUSED, () => this._emit(events.BROADCAST_PAUSED, targetGroupId));
    client.on(events.BROADCAST_RESUME, () => this._emit(events.BROADCAST_RESUME, targetGroupId));
    client.on(events.BROADCAST_STOPPED, () => this._emit(events.BROADCAST_STOPPED, targetGroupId));
    client.on(events.BROADCAST_UNMUTED, (data) => this._emit(events.BROADCAST_UNMUTED, targetGroupId, { sourceSubscriberId: data }));
    client.on(events.BROADCAST_MUTED, (data) => this._emit(events.BROADCAST_MUTED, targetGroupId, { sourceSubscriberId: data }));
    client.on(events.BROADCAST_START, () => this._emit(events.BROADCAST_START, targetGroupId));
    client.on(events.BROADCAST_DURATION, (data) => this._emit(events.BROADCAST_DURATION, targetGroupId, { duration: data }));
    this._clients[targetGroupId] = client;

    return client;
  }

  async getClient (targetGroupId, createIfDoesntExist = false) {
    if (!await commandExists('ffmpeg')) {
      throw new Error('ffmpeg must be installed on this device to create or use a stage client');
    }

    const client = this._clients[targetGroupId];

    if (client || !createIfDoesntExist) {
      return client;
    }

    return this._initClient(targetGroupId);
  }

  async removeClient (targetGroupId) {
    return this._removeClient(targetGroupId);
  }

  async closeAll () {
    for (const id of Object.keys(this._clients)) {
      this._removeClient(id);
    }
  }
}

module.exports = Manager;
