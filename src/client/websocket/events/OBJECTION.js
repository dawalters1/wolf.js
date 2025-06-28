import BaseEvent from './baseEvent.js';
import WOLFResponse from '../../../entities/WOLFResponse.js';

class ObjectionEvent extends BaseEvent {
  constructor (client) {
    super(client, 'objection');
  }

  async process (data) {
    // API Key is not valid, stop all connection attempts
    if (data.reconnectSeconds < 0) {
      this.client.websocket.disconnect();
    }

    this.client.emit(
      'loginFailed',
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
