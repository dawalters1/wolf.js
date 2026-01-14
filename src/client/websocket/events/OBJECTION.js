import BaseEvent from './BaseEvent.js';
import WOLFResponse from '../../../entities/WOLFResponse.js';

export default class ObjectionEvent extends BaseEvent {
  constructor (client) {
    super(client, 'objection');
  }

  async process (data) {
    this.client.websocket.socket.reconnectionDelayOverride = data.reconnectSeconds === -1
      ? -1
      : data.reconnectSeconds * 1000;

    return this.client.emit(
      'objection',
      new WOLFResponse(
        {
          code: data.code,
          headers: new Map(
            [
              ['message', data.message],
              ['subCode', data.subCode],
              ['reconnectSeconds', data.reconnectSeconds]
            ]
          )
        })
    );
  }
}
