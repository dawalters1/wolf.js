'use strict';
const CommandObject = require('../models/CommandObject');
const { Events, Privilege, MessageType } = require('../constants');
const Command = require('./Command');

/**
 * Flags that unofficial bots should never have, check their profile before requesting summary
 */
const ignoreTagList = [
  Privilege.STAFF,
  Privilege.ENTERTAINER,
  Privilege.SELECTCLUB_1,
  Privilege.SELECTCLUB_2,
  Privilege.VOLUNTEER,
  Privilege.PEST,
  Privilege.GROUP_ADMIN,
  Privilege.ENTERTAINER,
  Privilege.RANK_1,
  Privilege.ELITECLUB_1,
  Privilege.ELITECLUB_2,
  Privilege.ELITECLUB_3,
  Privilege.BOT,
  Privilege.BOT_TESTER,
  Privilege.CONTENT_SUBMITER,
  Privilege.ALPHA_TESTER,
  Privilege.TRANSLATOR
];

/**
 * {@hideconstructor}
 */
module.exports = class CommandHandler {
  constructor (api) {
    this._api = api;
    this._commands = [];

    this._api.on(Events.GROUP_MESSAGE, async message => await this._processMessage(message));
    this._api.on(Events.PRIVATE_MESSAGE, async message => await this._processMessage(message));
  }

  isCommand (message) {
    return this._commands.find((command) => {
      if (this._api._phrase.isRequestedPhrase(command.phraseName, message.body.split(/[\s]+/).filter(Boolean)[0])) {
        const commandCallbacks = command.commandCallbackTypes;

        // Check to see if the command is valid for the message type
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

  async _processMessage (message) {
    try {
      if (!message.body || message.type !== MessageType.TEXT_PLAIN || (message.sourceSubscriberId === this._api.currentSubscriber.id && !this._api.options.commandHandling.processOwnMessages) || await this._api._banned.isBanned(message.sourceSubscriberId)) {
        return Promise.resolve();
      }

      const commandContext = {
        isGroup: message.isGroup,
        language: null,
        argument: message.body,
        targetGroupId: message.targetGroupId,
        sourceSubscriberId: message.sourceSubscriberId,
        timestamp: message.timestamp,
        type: message.type
      };

      const commandCollection = this._commands.find((command) => {
        const match = this._api._phrase.getAllByName(command.phraseName).find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase());

        if (match) {
          if (command.commandCallbackTypes.includes(Command.getCallback.BOTH) ||
        (commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) ||
        (!commandContext.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE))) {
            commandContext.argument = commandContext.argument.substr(match.value.length).trim();
            commandContext.language = match.language;
            commandContext.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !commandContext.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;
            return command;
          }
        }

        return false;
      });

      if (!commandCollection || (this._api.options.ignoreOfficialBots && await this._api._utility._subscriber._privilege.has(message.sourceSubscriberId, Privilege.BOT)) || (this._api.options.ignoreUnofficialBots && !await this._api._utility._subscriber._privilege.has(message.sourceSubscriberId, ignoreTagList) && await this._api._utility._subscriber.hasCharm(message.sourceSubscriberId, this._api._botConfig.get('validation.charms.unofficialBots')))) {
        return Promise.resolve();
      }

      const command = this._getCurrentOrChildCommand(commandCollection, commandContext);

      const callback = command.callback;

      Reflect.deleteProperty(command, 'callback');
      return callback.call(this, new CommandObject(command));
    } catch (error) {
      Reflect.deleteProperty(message, '_api'); // Delete api to prevent circular reference
      error.internalErrorMessage = `Error handling ${message.isGroup ? 'Group' : 'Private'} Command!\nMessage: ${JSON.stringify(message, null, 4)}\nData: ${error.method}\n${error.stack}`;
      throw error;
    }
  }

  _getCurrentOrChildCommand (parentCommand, commandContext) {
    if (!commandContext.argument) {
      return commandContext;
    }

    const command = parentCommand.children.find((child) => {
      const match = this._api._phrase.getAllByName(child.phraseName).find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/).filter(Boolean)[0].toLowerCase());

      if (match) {
        if (child.commandCallbackTypes.includes(Command.getCallback.BOTH) || (commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!commandContext.isGroup && child.commandCallbackTypes.includes(Command.getCallback.PRIVATE))) {
          commandContext.argument = commandContext.argument.substr(match.value.length).trim();
          commandContext.callback = child.commandCallbackTypes.includes(Command.getCallback.BOTH) ? child.commandCallbacks.both : !commandContext.isGroup ? child.commandCallbacks.private : child.commandCallbacks.group;
          return child;
        }
      }

      return false;
    });

    if (!command || command.children.length === 0) {
      return commandContext;
    }

    return this._getCurrentOrChildCommand(command, commandContext);
  }
};
