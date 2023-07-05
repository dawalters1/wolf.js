import Base from './Base.js';

class ChannelExtended extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.longDescription = data?.longDescription;
    this.discoverable = data?.discoverable;
    this.language = data?.language;
    this.category = data?.category;
    this.advancedAdmin = data?.advancedAdmin;
    this.questionable = data?.questionable;
    this.locked = data?.locked;
    this.closed = data?.closed;
    this.passworded = data?.passworded;
    this.entryLevel = data?.entryLevel;
  }

  async update ({ longDescription, discoverable, language, category, advancedAdmin, questionable, locked, closed, entryLevel }) {
    return await this.client.channel.update(this.id, { longDescription, discoverable, language, category, advancedAdmin, questionable, locked, closed, entryLevel });
  }
}

export default ChannelExtended;
