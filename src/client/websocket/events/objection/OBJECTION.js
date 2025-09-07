import { patch } from '../../../../utils/index.js';
import { Event, ServerEvent } from '../../../../constants/index.js';
import models, { Response } from '../../../../models/index.js';
import Base from '../Base.js';

/**
 * @param {import('../../../WOLF.js').default} this.client
 */
class Objection extends Base {
  constructor (client) {
    super(client, ServerEvent.OBJECTION);
  }

  async process (body) {
   
    this.client.websocket.socket.reconnectionDelay = body.reconnectSeconds === -1
      ? -1
      : body.reconnectSeconds * 1000;

    return this.client.emit(
        Event.LOGIN_FAILED,
        new Response({
            code: body.code, 
            headers: {
                message: body.message,
                subCode: body.subCode,
                reconnectSeconds: body.reconnectSeconds
            }
        })
    );
  };
}
export default Objection;
