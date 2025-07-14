import BaseEvent from './baseEvent.js';
import Tip from '../../../entities/tip.js';
class TipAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'tip add');
  }

  async process (data) {
    const channel = this.client.channel.cache.get(data.groupId);

    if (channel === null) { return; }

    this.client.emit(
      'tipAdd',
      new Tip(this.client, data)
    );
  }
}

export default TipAddEvent;
