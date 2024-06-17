import BaseEvent from './Base.js';

class GroupRoleSubscriberUnassign extends BaseEvent {
  constructor () {
    super('group role subscriber unassign');
  }
}

export default GroupRoleSubscriberUnassign;
