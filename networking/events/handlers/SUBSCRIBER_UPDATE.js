
const BaseEvent = require('../BaseEvent');

module.exports = class SubscriberUpdate extends BaseEvent {
  async process (data) {
    const existing = await this._bot.subscriber()._subscribers.find((subscriber) => subscriber.id === data.id);

    if (existing && existing.hash !== data.hash) {
      const subscriber = await this._bot.subscriber().getById(data.id, true);

      const groups = await this._bot.group()._getJoinedGroups();

      for (const group of groups) {
        if (group.subscribers) {
          const member = group.subscribers.find((subscriber) => subscriber.id === data.subscriber);

          if (member) {
            member.additionalInfo.nickname = subscriber.nickname;
            member.additionalInfo.privileges = subscriber.privileges;
          }
        }
      }

      if (this._bot.blocked().isBlocked(data.id)) {
        this._bot.blocked()._patch(subscriber);
      }

      if (this._bot.contact().isContact(data.id)) {
        this._bot.contact()._patch(subscriber);
      }

      this._bot.on._emit(this._command, subscriber);
    }

    return Promise.resolve();
  }
};
