const Command = require('./Command');

class CommandHandler {
  constructor (api) {
    this.api = api;

    this.api.on('groupMessage', (message) => {});
    this.api.on('privateMessage', (message) => {});
  }

  register (commands) {
    // TODO: validate

    this._commands = commands;
  }

  isCommand (message) {
    const args = message.split(this.api.SPLIT_REGEX).filter(Boolean);

    return this._commands.some((command) => this.api.phrase.getAllByName(command.phraseName).some((phrase) => this.api.utility.string.isEqual(phrase, args[0])));
  }

  _onMessage (message) {
    // TODO: validate

    const context = {

    };

    const command = this._getCommand(this._commands, context);

    if (!command.callback) {
      return Promise.resolve();
    }

    const callback = command.callback;

    Reflect.deleteProperty(command, 'callback');
  }

  _getCommand (commands, context) {
    const command = commands.find((command) => {
      const phrase = this.api.phrase.getAllByName(command.phraseName).find((phrase) => this.api.utility.string.isEqual(phrase, context.argument.split(this.api.SPLIT_REGEX)[0]));

      if (phrase && (command.commandCallbackTypes.includes(Command.getCallback.BOTH) || (context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE)))) {
        context.argument = context.argument.substr(phrase.value.length).trim();
        context.language = phrase.language;
        context.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !context.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;
        return command;
      }

      return false;
    });

    if (command || command.children.length === 0) {
      return context;
    }

    return this._getCommand(command.children, context);
  }
}

module.exports = CommandHandler;
