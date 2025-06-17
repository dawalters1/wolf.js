import BaseEvent from './baseEvent';
import WOLF from '../../WOLF';
import WOLFResponse from '../../../structures/WOLFResponse';

interface ServerObjection {
    code: number;
    subCode: number;
    message: string;
    reconnectSeconds: number
}

class ObjectionEvent extends BaseEvent<ServerObjection> {
  constructor (client: WOLF) {
    super(client, 'objection');
  }

  async process (data: ServerObjection) {
    // API Key is not valid, stop all connection attempts
    if (data.reconnectSeconds < 0) {
      this.client.websocket.disconnect();
    }

    this.client.emit(
      'loginFailed',
      new WOLFResponse(
        {
          code: data.code,
          headers: new Map<string, any>(
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
