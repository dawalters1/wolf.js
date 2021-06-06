
const BaseEvent = require('../BaseEvent');

module.exports = class PresenceUpdate extends BaseEvent {
  async process (data) {
    const groups = await this._bot.group()._getJoinedGroups();

    for (const group of groups) {
      if (group.subscribers) {
        const member = group.subscribers.find((subscriber) => subscriber.id === data.subscriber);

        if (member) {
          member.additionalInfo.onlineState = data.onlineState;
        }
      }
    }

    const subscriber = await this._bot.subscriber()._cache.find((subscriber) => subscriber.id === data.id);

    if (subscriber) {
      this._bot.subscriber()._process(data);
    }

    if (this._bot.contact().isContact(data.id)) {
      this._bot.contact()._patch(data);
    }

    if (this._bot.blocked().isBlocked(data.id)) {
      this._bot.blocked()._patch(data);
    }

    this._bot.on._emit(this._command, subscriber, data);
  }
};
