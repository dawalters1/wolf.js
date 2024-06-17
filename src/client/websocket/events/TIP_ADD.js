import BaseEvent from './Base.js';

class TipAdd extends BaseEvent {
  constructor () {
    super('tip add');
  }
}

export default TipAdd;
