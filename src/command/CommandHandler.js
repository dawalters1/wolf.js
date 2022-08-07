import models from "../models/index.js";
import Command from "./Command.js";
import { Privilege } from "../constants/index.js";
import WOLFAPIError from "../models/WOLFAPIError.js";
const CHARM_IDS = [813, 814];
const checkForPrivilege = async (client, subscriber, privileges) => {
    privileges = Array.isArray(privileges) ? privileges : [privileges];
    return privileges.some((privilege) => (subscriber.privileges & privilege) === privilege);
};
const checkForBotCharm = async (client, subscriber) => {
    if (subscriber.charms && subscriber.charms.selectedList.some((charm) => CHARM_IDS.includes(charm.charmId))) {
        return true;
    }
    if (subscriber.charmSummary) {
        return subscriber.charmSummary.some((charm) => CHARM_IDS.includes(charm.charmId));
    }
    subscriber.charmSummary = await client.charm.getSubscriberSummary(subscriber.id);
    return await checkForBotCharm(client, subscriber);
};
class CommandHandler {
    constructor(client) {
        this.client = client;
        this._commands = [];
        this.client.on('message', async (message) => {
            const commandHandling = this.client.options.commandHandling;
            if (!message.body || await this.client.banned.isBanned(message.sourceSubscriberId) || (!commandHandling.processOwnMessages && message.sourceSubscriberId === this.client.currentSubscriber.id)) {
                return Promise.resolve();
            }
            const context = {
                isGroup: message.isGroup,
                argument: message.body,
                targetGroupId: message.targetGroupId,
                sourceSubscriberId: message.sourceSubscriberId,
                timestamp: message.timestamp,
                type: message.type
            };
            const command = this._getCommand(this._commands, context);
            if (!command.callback) {
                return Promise.resolve();
            }
            if (commandHandling.ignoreOfficialBots || commandHandling.ignoreUnofficialBots) {
                const subscriber = await this.client.subscriber.getById(context.sourceSubscriberId);
                if (commandHandling.ignoreOfficialBots && await checkForPrivilege(this.client, subscriber, Privilege.BOT)) {
                    return Promise.resolve();
                }
                if (command.ignoreUnofficialBots && !await checkForPrivilege(this.client, subscriber, [Privilege.STAFF, Privilege.ENTERTAINER, Privilege.SELECTCLUB_1, Privilege.SELECTCLUB_2, Privilege.VOLUNTEER, Privilege.PEST, Privilege.GROUP_ADMIN, Privilege.ENTERTAINER, Privilege.RANK_1, Privilege.ELITECLUB_1, Privilege.ELITECLUB_2, Privilege.ELITECLUB_3, Privilege.BOT, Privilege.BOT_TESTER, Privilege.CONTENT_SUBMITER, Privilege.ALPHA_TESTER, Privilege.TRANSLATOR]) && await checkForBotCharm(this.client, subscriber)) {
                    return Promise.resolve();
                }
            }
            const callback = command.callback;
            Reflect.deleteProperty(command, 'callback');
            return callback.call(this, new models.CommandContext(this.client, command));
        });
    }
    register(commands) {
        commands = Array.isArray(commands) ? commands : [commands];
        if (commands.length === 0) {
            throw new WOLFAPIError('commands cannot be empty', { commands });
        }
        this._commands = commands;
    }
    isCommand(message) {
        const args = message.split(this.client.SPLIT_REGEX).filter(Boolean);
        return this._commands.some((command) => this.client.phrase.getAllByName(command.phraseName).some((phrase) => this.client.utility.string.isEqual(phrase, args[0])));
    }
    _getCommand(commands, context) {
        const command = commands.find((command) => {
            const phrase = this.client.phrase.getAllByName(command.phraseName).find((phrase) => this.client.utility.string.isEqual(phrase, context.argument.split(this.client.SPLIT_REGEX)[0]));
            if (phrase && (command.commandCallbackTypes.includes(Command.getCallback.BOTH) || (context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.GROUP)) || (!context.isGroup && command.commandCallbackTypes.includes(Command.getCallback.PRIVATE)))) {
                context.argument = context.argument.substr(phrase.value.length).trim();
                context.language = phrase.language;
                context.callback = command.commandCallbackTypes.includes(Command.getCallback.BOTH) ? command.commandCallbacks.both : !context.isGroup ? command.commandCallbacks.private : command.commandCallbacks.group;
                return command;
            }
            return false;
        });
        if (!command || command.children.length === 0) {
            return context;
        }
        return this._getCommand(command.children, context);
    }
}
export default CommandHandler;
