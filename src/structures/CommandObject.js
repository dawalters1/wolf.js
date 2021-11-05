
class CommandObject {
  constructor (data) {
    this.isGroup = data.isGroup;
    this.language = data.language;
    this.argument = data.argument;
    this.message = data.message;
    this.targetGroupId = data.targetGroupId;
    this.sourceSubscriberId = data.sourceSubscriberId;
    this.timestamp = data.timestamp;
    this.type = data.type;
  }
}

module.exports = CommandObject;
