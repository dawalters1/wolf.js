<<<<<<< HEAD
import BaseEvent from './BaseEvent.js';

export default class PresenceUpdateEvent extends BaseEvent {
  constructor (client) {
    super(client, 'presence update');
  }
}
=======
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
>>>>>>> 2af9a5522db867b270d85bcd4729dc6318a4ab82
