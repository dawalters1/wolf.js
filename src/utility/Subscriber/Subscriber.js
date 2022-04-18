const Base = require('../Base');

class Subscriber extends Base {
  async hasPrivilege (targetSubscriberId, privileges, allRequired = false) {
    privileges = Array.isArray(privileges) ? privileges : [privileges];

    let subscriberPrivileges = 0;

    if (this.api.group._groups.some((group) => group.subscribers.isInGroup(targetSubscriberId))) {
      subscriberPrivileges = (await this.api.group._groups.find((group) => group.subscribers.isInGroup(targetSubscriberId)).subscribers.get(targetSubscriberId)).additionalInfo.privileges;
    } else {
      subscriberPrivileges = (await this.api.subscriber.getById(targetSubscriberId)).privileges;
    }

    return allRequired ? privileges.every((privilege) => (subscriberPrivileges & privilege) === privilege) : privileges.some((privilege) => (subscriberPrivileges & privilege) === privilege);
  }
}

module.exports = Subscriber;
