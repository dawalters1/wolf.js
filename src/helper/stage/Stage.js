import WOLFAPIError from '../../models/WOLFAPIError.js';
import Base from '../Base.js';
import Request from './Request.js';
import Slot from './Slot.js';
import StageClient from '../../client/stage/Client.js';

class Stage extends Base {
  // eslint-disable-next-line no-useless-constructor
  constructor (client) {
    super(client);

    this.request = new Request(this.client);
    this.slot = new Slot(this.client);

    this.client.on('groupAudioCountUpdate', (oldCount, newCount) => {});
    this.client.on('groupAudioSlotUpdate', (oldSlot, newSlot) => {});

    this.clients = {};
  }

  _getClient (targetGroupId, createIfNotExists = false) {
    if (this.clients[targetGroupId]) {
      return this.clients[targetGroupId];
    }

    if (createIfNotExists) {
      const client = new StageClient();

      // TODO: internal client events

      this.clients[targetGroupId] = client;
    }

    return this.clients[targetGroupId];
  }

  _deleteClient (targetGroupId) {
    this.clients[targetGroupId]?.stop();

    Reflect.deleteProperty(this.clients, targetGroupId);
  }

  async play (targetGroupId, stream) {
    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    if (!stream || typeof (stream) !== typeof (ReadableStream)) {
      //   throw new WOLFAPIError('stream must be type readable stream', { stream });
    }

    return await this.clients[targetGroupId].play(stream);
  }

  async stop (targetGroupId) {
    if (!this.clients[targetGroupId]) {
      throw new WOLFAPIError('bot is not on stage', { targetGroupId });
    }

    return await this.clients[targetGroupId].stop();
  }
}

export default Stage;
