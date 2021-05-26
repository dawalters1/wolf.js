
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

    const subscriber = await this._bot.subscriber().getById(data.id);

    if (subscriber) {
      subscriber.onlineState = data.onlineState;
      subscriber.deviceType = data.deviceType;
    }

    if (this._bot.contact().isContact(data.id)) {
      const contact = this._bot.contact().list().find((contact) => contact.id === data.id);

      contact.onlineState = data.onlineState;
      contact.deviceType = data.deviceType;
    }

    if (this._bot.blocked().isBlocked(data.id)) {
      const blocked = this._bot.blocked().list().find((blocked) => blocked.id === data.id);

      blocked.onlineState = data.onlineState;
      blocked.deviceType = data.deviceType;
    }

    this._bot.on._emit(this._command, subscriber, data);
  }
};
