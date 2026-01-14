import BaseEvent from './BaseEvent.js';
import UserPresence from '../../../entities/UserPresence.js';

export default class PresenceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'presence update');
  }

  async process (data) {
    const user = this.client.user.store.get((item) => item.id === data.id);

    if (user === null) { return; }

    const oldPresence = user.presence?.clone();

    user.presence.value = user.presence?.patch(data) ?? new UserPresence(this.client, data);

    return this.client.emit(
      'userPresenceUpdate',
      oldPresence,
      user.presence.value
    );
  }
}
