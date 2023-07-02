import Base from './Base.js';
import ChannelMember from './ChannelMember.js';
import WOLFAPIError from './WOLFAPIError.js';

class ChannelMemberListSection extends Base {
  constructor (client, targetChannelId, list, capabilities, privileges) {
    super(client);

    this.list = list;
    this.targetChannelId = targetChannelId;

    this.capabilities = capabilities ? Array.isArray(capabilities) ? capabilities : [capabilities] : undefined;
    this.privileges = privileges ? Array.isArray(privileges) ? privileges : [privileges] : undefined;

    this.complete = false;
    this.members = [];
  }

  async get (subscriber) {
    if (typeof subscriber === 'object' && !subscriber.id) {
      // eslint-disable-next-line no-prototype-builtins
      throw new WOLFAPIError('subscriber must have property id', { subscriber: subscriber.hasOwnProperty('toJSON') ? subscriber.toJSON() : subscriber });
    }

    const subscriberId = subscriber?.id ?? subscriber;

    const member = this.members.find((member) => member.id === subscriberId);

    return member
      ? {
          member,
          list: this.list
        }
      : null;
  }

  async add (subscriber, capabilities) {
    if (this.capabilities && !this.capabilities.includes(capabilities)) {
      return false;
    }

    if (this.privileges && !await this.client.utility.subscriber.privilege.has(subscriber.id, this.privileges)) {
      return false;
    }

    // Verify there are capabilities or privileges else its misc, and that subscriber ID is smaller than the largest IDs in the list
    if ((this.capabilities || this.privileges) && !this.complete && !this.members.some((member) => member.id > subscriber.id)) {
      return false;
    }

    // Prevent duplicates
    if (this.members.some((member) => member.id === subscriber.id)) {
      return true;
    }

    this.members.push(new ChannelMember(this.client, { id: subscriber.id, capabilities, hash: subscriber.hash, targetChannelId: this.targetChannelId }));

    return true;
  }

  async remove (subscriber) {
    if (typeof subscriber === 'object' && !subscriber.id) {
      // eslint-disable-next-line no-prototype-builtins
      throw new WOLFAPIError('subscriber must have property id', { subscriber: subscriber.hasOwnProperty('toJSON') ? subscriber.toJSON() : subscriber });
    }

    const subscriberId = subscriber?.id ?? subscriber;

    if (!this.members.some((member) => member.id === subscriberId)) {
      return Promise.resolve();
    }

    return this.members.splice(this.members.findIndex((member) => member.id === subscriberId), 1);
  }

  async updateSubscriber (subscriber) {
    if (!this.members.some((member) => member.id === subscriber.id)) {
      return Promise.resolve();
    }

    this.members.find((member) => member.id === subscriber.id).hash = subscriber.hash;
  }

  async update (subscriber, capabilities) {
    // If capabilities list, check if compatible and update if exists, if not compatible remove if exists
    if (this.capabilities && !this.capabilities.includes(capabilities)) {
      return this.remove(subscriber);
    }

    if (!this.members.some((member) => member.id === subscriber.id)) {
      return this.add(subscriber, capabilities);
    }

    // If privilege list, update existing members capabilties
    this.members.find((member) => member.id === subscriber.id).capabilities = capabilities;
  }

  reset () {
    this.members = [];
    this.complete = false;
  }
}

export default ChannelMemberListSection;
