
import models from './index.js';

class GroupMemberListSection {
  constructor (client, name) {
    this.client = client;
    this.name = name;

    this.members = [];
    this.complete = false;

    this.lastRequestedId = 0;
  }

  _get (subscriberId) {
    return this.members.find((member) => member.id === subscriberId);
  }

  _fromRequest (members, successful) {
    this.members.push(...(Array.isArray(members) ? members : [members]));
    this.complete = Array.isArray(members) && successful && members.length < this.client._botConfig.get(`members.${this.name}.batch.size`);
    this.lastRequestedId = Array.isArray(members) ? members.sort((a, b) => a.id - b.id).splice(-1)[0]?.id ?? this.lastRequestedId : this.lastRequestedId;

    return members;
  }

  async _add (subscriber, capabilities) {
    const config = this.client._botConfig.get(`members.${this.name}`);

    if (config.capabilities && !config.capabilities.includes(capabilities)) {
      return Promise.resolve();
    }

    if (config.privileges && !await this.client.utility.subscriber.privilege.has(subscriber.id, config.privileges)) {
      return Promise.resolve();
    }

    this.members.push(
      new models.GroupMember(
        this.client,
        {
          id: subscriber.id,
          hash: subscriber.hash,
          capabilities
        }
      )
    );

    // Prevent this member from being requested again if they magically are the next ID in the list after the last requested
    this.lastRequestedId = this.lastRequestedId + 1 === subscriber.id ? subscriber.id : this.lastRequestedId;

    return Promise.resolve();
  }

  async _delete (subscriber) {
    if (!this._get(subscriber.id)) {
      return Promise.resolve();
    }

    this.members.splice(this.members.findIndex((member) => member.id === subscriber.id), 1);

    this.lastRequestedId = this.lastRequestedId === subscriber.id ? this.members.sort((a, b) => a.id - b.id).splice(-1)[0]?.id ?? 0 : this.lastRequestedId;

    return Promise.resolve();
  }

  async _update (subscriber, capabilities) {
    const config = this.client._botConfig.get(`members.${this.name}`);

    const existing = this._get(subscriber.id);

    if (!existing) {
      return await this._add(subscriber, capabilities);
    }

    if (config.capabilities.includes(capabilities)) {
      existing.capabilities = capabilities;
    }

    return await this._delete(subscriber, true);
  }
}

export default GroupMemberListSection;
