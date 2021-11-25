class CommandObject {
  constructor (commandContext) {
    this.isGroup = commandContext.isGroup;
    this.language = commandContext.language;
    this.argument = commandContext.argument;
    this.message = commandContext.message;
    this.targetGroupId = commandContext.targetGroupId;
    this.sourceSubscriberId = commandContext.sourceSubscriberId;
    this.timestamp = commandContext.timestamp;
    this.type = commandContext.type;
  }
}

module.exports = CommandObject;
