'use strict';
const { privilege, messageType } = require('@dawalters1/constants');
const Command = require('./Command');

module.exports = class CommandHandler {
  constructor (api) {
    this._api = api;
    this._commands = [];

    this._api.on.privateMessage(async message => {
      try {
        await this.processMessage(message);
      } catch (error) {
        error.message = `Error handling Private Command!\nMessage: ${JSON.stringify(message, null, 4)}\nData: ${error.method}\n${error.toString()}`;
        throw error;
      }
    });

    this._api.on.groupMessage(async message => {
      try {
        await this.processMessage(message);
      } catch (error) {
        error.message = `Error handling Group Command!\nMessage: ${JSON.stringify(message, null, 4)}\nData: ${error.method}\n${error.toString()}`;
        throw error;
      }
    });
  }

  isCommand (message) {
    return this._commands.find((command) => {
      const match = this._api.phrase().getAllByName(command.trigger).find(phrase => phrase.value.toLowerCase() === message.body.split(/[\s]+/)[0].toLowerCase());

      if (match) {
        const commandCallbacks = command.commandCallbackTypes;

        if (commandCallbacks.includes(Command.getCallback.BOTH) || (message.isGroup && commandCallbacks.includes(Command.getCallback.GROUP)) || (!message.isGroup && commandCallbacks.includes(Command.getCallback.PRIVATE))) {
          return true;
        }
      }
      return false;
    }) !== undefined;
  }

  register (commands) {
    this._commands = commands;
  }

  async processMessage (message) {
    if (!message.body || message.type !== messageType.TEXT_PLAIN || message.sourceSubscriberId === this._api.currentSubscriber.id || this._api.banned().isBanned(message.sourceSubscriberId)) {
      return Promise.resolve();
    }

    const commandContext = {
      isGroup: message.isGroup,
      language: null,
      argument: message.body,
      message: message,
      targetGroupId: message.targetGroupId,
      sourceSubscriberId: message.sourceSubscriberId,
      timestamp: message.timestamp,
      type: message.type,
      route: []
    };

    const commandCollection = this._commands.find((command) => {
      const match = this._api.phrase().getAllByName(command.trigger).find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase());

      if (match) {
        if (command.commandCallbackTypes.includes(Command.getCallback.BOTH) || (commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE))) {
          commandContext.argument = commandContext.argument.substr(match.value.length).trim();
          commandContext.language = match.language;
          commandContext.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !commandContext.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;
          commandContext.route.push(match.value);
          return command;
        }
      }

      return false;
    });

    if (!commandCollection || (this._api.config.options.ignoreOfficialBots && await this._api.utility().privilege().has(message.sourceSubscriberId, privilege.BOT))) {
      return Promise.resolve();
    }

    const command = this._getChildCommand(commandCollection, commandContext);

    const callback = command.callback;

    delete command.callback;

    return callback.call(this, command);
  }

  _getChildCommand (parentCommand, commandContext) {
    if (!commandContext.argument) {
      return commandContext;
    }

    const command = parentCommand.children.find((child) => {
      const match = this._api.phrase().getAllByName(child.trigger).find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase());

      if (match) {
        if (child.commandCallbackTypes.includes(Command.getCallback.BOTH) || (commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.PRIVATE))) {
          commandContext.argument = commandContext.argument.substr(match.value.length).trim();
          commandContext.callback = child.commandCallbackTypes.includes(Command.getCallback.BOTH) ? child.commandCallbacks.both : !commandContext.isGroup ? child.commandCallbacks.private : child.commandCallbacks.group;
          commandContext.route.push(match.name);
          return child;
        }
      }

      return false;
    });

    if (!command || command.children.length === 0) {
      return commandContext;
    }

    return this._getChildCommand(command, commandContext);
  }
};
