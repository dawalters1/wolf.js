import BaseEvent from './BaseEvent.js';
import Tip from '../../../entities/Tip.js';

export default class TipAddEvent extends BaseEvent {
  constructor (client) {
    super(client, 'tip add');
  }

  async process (data) {
    const channel = this.client.channel.store.get((item) => item.id === data.groupId);

    if (channel === null) { return; }

    return this.client.emit(
      'tipAdd',
      new Tip(this.client, data)
    );
  }
}
