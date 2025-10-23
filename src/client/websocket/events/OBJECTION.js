import BaseEvent from './baseEvent.js';
import WOLFResponse from '../../../entities/WOLFResponse.js';

class ObjectionEvent extends BaseEvent {
  constructor (client) {
    super(client, 'objection');
  }

  async process (data) {
    this.client.websocket.socket.reconnectionDelay = data.reconnectSeconds === -1
      ? -1
      : data.reconnectSeconds * 1000;

    this.client.emit(
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

export default ObjectionEvent;
