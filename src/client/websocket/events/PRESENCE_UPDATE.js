import BaseEvent from './baseEvent.js';

class PresenceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'presence update');
  }

  async process (data) {
    const user = this.client.user.store.get(data.id);

    if (user === null) { return; }

    this.client.emit(
      'userPresenceUpdate',
      user.presenceStore.patch(data)
    );
  }
}

export default PresenceUpdateEvent;
