
'use strict';
const Command = require('./Command');

/**
Cancerous code, dont care lol, it works.
*/
class CommandHandler {
  constructor (bot) {
    this._bot = bot;
    this._commands = [];
    bot.on.messageReceived(async message => await this.processMessage(message));
  }

  isCommand (input) {
    return this._commands.reduce((result, command) => {
      if (!result) {
        const phrases = this._bot.phrase().getAllByName(command.trigger);

        const match = phrases.find(phrase => phrase.value.toLowerCase() === input.toLowerCase());

        if (match) {
          result = true;
        }
      }

      return result;
    }, false);
  }

  register (commands) {
    const validateCommands = cmds => {
      cmds.forEach(command => {
        const phrase = this._bot.phrase().getAllByName(command.trigger);

        if (!phrase) {
          throw Error(`Missing phrase ${command.trigger}`);
        }

        if (command.children.length > 0) {
          validateCommands(command.children);
        }
      });
    };

    validateCommands(commands);

    this._commands = commands;
  }

  async processMessage (message) {
    if (!message.body) {
      return Promise.resolve();
    }

    const commandContext = {
      isGroup: message.isGroup,
      language: null,
      argument: message.body,
      message: message,
      targetGroupId: message.targetGroupId,
      sourceSubscriberId: message.sourceSubscriberId
    };

    const baseCommand = this._commands.reduce((result, command) => {
      if (!result) {
        const phrases = this._bot.phrase().getAllByName(command.trigger);

        // eslint-disable-next-line max-len
        const match = phrases.find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase());

        if (match) {
          if (
            command.commandCallbackTypes.includes(Command.getCallback.BOTH) ||
                        (commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) ||
                        (!commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE))
          ) {
            commandContext.argument = commandContext.argument.substr(match.value.length).trim();
            commandContext.language = match.language;
            commandContext.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !commandContext.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;

            return command;
          }
        }
      }
      return result;
    }, false);

    if (!baseCommand) {
      return Promise.resolve();
    }

    const command = this._getChildCommand(baseCommand, commandContext);

    const callback = command.callback;

    delete command.callback;

    return callback.call(this, command);
  }

  _getChildCommand (command, commandContext) {
    if (!commandContext.argument) {
      return commandContext;
    }

    const foundCommand = command.children.reduce((result, child) => {
      if (!result) {
        const phrase = this._bot.phrase().getByLanguageAndName(commandContext.language, child.trigger);

        if (phrase) {
          if (phrase.toLowerCase() === commandContext.argument.split(' ')[0].toLowerCase()) {
            if (
              child.commandCallbackTypes.includes(Command.getCallback.BOTH) ||
                            (commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.GROUP)) ||
                            (!commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.PRIVATE))
            ) {
              commandContext.argument = commandContext.argument.substr(phrase.length).trim();
              commandContext.callback = child.commandCallbackTypes.includes(Command.getCallback.BOTH) ? child.commandCallbacks.both : !commandContext.isGroup ? child.commandCallbacks.private : child.commandCallbacks.group;
              return child;
            }
          }
        }
      }
      return result;
    }, false);

    if (!foundCommand) {
      return commandContext;
    }

    return this._getChildCommand(foundCommand, commandContext);
  }
}

module.exports = CommandHandler;
