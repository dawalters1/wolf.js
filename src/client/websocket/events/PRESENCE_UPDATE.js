import BaseEvent from './Base.js';

class PresenceUpdate extends BaseEvent {
  constructor () {
    super('presence update');
  }
}

export default PresenceUpdate;
