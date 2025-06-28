import BaseEvent from './baseEvent.js';

class PresenceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'presence update');
  }

  async process (data) {
    const user = this.client.user.cache.get(data.id);

    if (user === null) { return; }

    this.client.emit(
      'userPresenceUpdate',
      user._presence.patch(data)
    );
  }
}

export default PresenceUpdateEvent;
