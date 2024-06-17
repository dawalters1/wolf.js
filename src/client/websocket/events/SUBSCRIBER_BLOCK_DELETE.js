import BaseEvent from './Base.js';

class SubscriberBlockDelete extends BaseEvent {
  constructor () {
    super('subscriber block delete');
  }
}

export default SubscriberBlockDelete;
