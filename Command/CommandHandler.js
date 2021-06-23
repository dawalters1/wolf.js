'use strict';
const {
    privilege
} = require('@dawalters1/constants');
const Command = require('./Command');

/**
Cancerous code, dont care lol, it works.
*/
module.exports = class CommandHandler {
    constructor(bot) {
        this._bot = bot;
        this._commands = [];
        bot.on.messageReceived(async message => {
            try {
                await this.processMessage(message);
            } catch (error) {
                error.message = `Error handling ${message.isGroup?'Group':'Private'} Command!\nMessage: ${JSON.stringify(message, null, 4)}\nData: ${error.method}\n${error.toString()}`;
                throw error;
            }
        });
    }

    isCommand(input) {
        return this._commands.reduce((result, command) => {
            if (!result) {
                const phrases = this._bot.phrase().getAllByName(command.trigger);

                const match = phrases.find(phrase => phrase.value.toLowerCase() === input.split(/[\s]+/)[0].toLowerCase());

                if (match) {
                    result = true;
                }
            }

            return result;
        }, false);
    }

    register(commands) {
        this._commands = commands;
    }

    async processMessage(message) {
        if (!message.body) {
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
            type: message.type
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

        if (!baseCommand || message.sourceSubscriberId === this._bot.currentSubscriber.id || this._bot.banned().isBanned(message.sourceSubscriberId)) {
            return Promise.resolve();
        }

        if ((this._bot.config.options.ignoreOfficialBots && await this._bot.utility().privilege().has(message.sourceSubscriberId, privilege.BOT))) {
            return Promise.resolve();
        }

        const command = this._getChildCommand(baseCommand, commandContext);

        const callback = command.callback;

        delete command.callback;

        return callback.call(this, command);
    }

    _getChildCommand(command, commandContext) {
        if (!commandContext.argument) {
            return commandContext;
        }

       const foundCommand = command.children.reduce((result, child) => {
            if (!result) {
                const phrases = this._bot.phrase().getAllByName(child.trigger);

                // eslint-disable-next-line max-len
                const match = phrases.find(phrase => phrase.value.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase());

                if (match) {
                    if (phrase.toLowerCase() === commandContext.argument.split(/[\s]+/)[0].toLowerCase()) {
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
