const BaseEvent = require('../BaseEvent');

module.exports = class PresenceUpdate extends BaseEvent {
  async process (data) {
    const groups = await this._api.group()._getJoinedGroups();

    for (const group of groups) {
      if (group.subscribers) {
        const member = group.subscribers.find((subscriber) => subscriber.id === data.subscriber);

        if (member) {
          member.additionalInfo.onlineState = data.onlineState;
        }
      }
    }

    const subscriber = await this._api.subscriber()._subscribers.find((subscriber) => subscriber.id === data.id);

    if (subscriber) {
      this._api.subscriber()._process(data);
    }

    if (this._api.contact()._contacts.length > 0 && this._api.contact().isContact(data.id)) {
      this._api.contact()._patch(data);
    }

    if (this._api.blocked()._blocked.length > 0 && this._api.blocked().isBlocked(data.id)) {
      this._api.blocked()._patch(data);
    }

    this._api.on._emit(this._command, subscriber, data);
  }
};
