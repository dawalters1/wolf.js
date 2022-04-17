
const Base = require('./Base');
const MessageEdit = require('./MessageEdit');
const MessageEmbed = require('./MessageEmbed');
const MessageMetadata = require('./MessageMetadata');

class Message extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.embeds = this.embeds ? this.embeds.map((embed) => new MessageEmbed(api, embed)) : undefined;
    this.metadata = this.metadata ? new MessageMetadata(api, this.metadata) : undefined;
    this.edited = this.edited ? new MessageEdit(api, this.edited) : undefined;
    this.isCommand = this.api.commandHandler.isCommand(this.body);
  }

  // TODO: Methods
}

module.exports = Message;
