import { Event, ServerEvent } from '../../../../constants/index.js';
import models from '../../../../models/index.js';
import Base from '../Base.js';

/**
 * @param {import('../../../../WOLF.js').default} this.client
 */

class TipAdd extends Base {
  constructor (client) {
    super(client, ServerEvent.TIP_ADD);
  }

  async process (body) {
    ((body.isGroup || body.groupId) ? [Event.GROUP_TIP_ADD, Event.CHANNEL_TIP_ADD] : [Event.PRIVATE_TIP_ADD])
      .map((event) =>
        this.client.emit(
          event,
          new models.Tip(this.client, body)
        )
      );
  }
}
export default TipAdd;
