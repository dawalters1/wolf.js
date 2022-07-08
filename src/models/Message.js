const Base = require('./Base');
const MessageEdit = require('./MessageEdit');
const MessageEmbed = require('./MessageEmbed');
const MessageMetadata = require('./MessageMetadata');

class Message extends Base {
  constructor (client, data) {
    super(client);

    this.id = data.id;
    this.body = data.data.toString().trim();
    this.sourceSubscriberId = data.originator?.id ?? data.originator;
    this.targetGroupId = data.isGroup ? data.recipient?.id ?? data.recipient.id : null;
    this.embeds = data.embeds ? data.embeds.map((embed) => new MessageEmbed(client, embed)) : null;
    this.metadata = data.metadata ? new MessageMetadata(client, data.metadata) : null;
    this.isGroup = data.isGroup;
    this.timestamp = data.timestamp;
    this.edited = data.edited ? new MessageEdit(client, data.edited) : null;
    this.type = data.mimeType;

    this.isCommand = client.commandHandler.isCommand(this.body);
  }
  // TODO: Methods
}

module.exports = Message;
