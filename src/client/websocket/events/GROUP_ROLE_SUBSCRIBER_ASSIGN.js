import BaseEvent from './Base.js';

class GroupRoleSubscriberAssign extends BaseEvent {
  constructor () {
    super('group role subscriber assign');
  }
}

export default GroupRoleSubscriberAssign;
