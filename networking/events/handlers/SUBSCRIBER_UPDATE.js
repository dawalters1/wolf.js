const BaseEvent = require('../BaseEvent');

/**
 * {@hideconstructor}
 */
module.exports = class SubscriberUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._api.subscriber()._subscribers.find((subscriber) => subscriber.id === data.id);

    if (existing && existing.hash !== data.hash) {
      const subscriber = await this._api.subscriber().getById(data.id, true);

      const groups = await this._api.group()._getJoinedGroups();

      for (const group of groups) {
        if (group.subscribers) {
          const member = group.subscribers.find((subscriber) => subscriber.id === data.subscriber);

          if (member) {
            member.additionalInfo.nickname = subscriber.nickname;
            member.additionalInfo.privileges = subscriber.privileges;
          }
        }
      }

      if (this._api.contact()._contacts.length > 0 && this._api.contact().isContact(subscriber.id)) {
        this._api.contact()._patch(subscriber);
      }

      if (this._api.blocked()._blocked.length > 0 && this._api.blocked().isBlocked(subscriber.id)) {
        this._api.blocked()._patch(subscriber);
      }

      this._api.on._emit(this._command, subscriber);
    }

    return Promise.resolve();
  }
};
