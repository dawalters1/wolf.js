import path, { dirname } from 'path';
import fs from 'fs';
import { Privilege } from '../constants/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {import('../client/WOLF.js').default} client
 * @param {import('../models/CommandContext.js').default} command
 */
export default async (client, command) => {
  if(client.config.framework.login.apiKey) { return false };

  if (command.sourceSubscriberId === client.currentSubscriber.id) { return false; }

  const argument = client.utility.number.toEnglishNumbers(command.argument)?.split(client.SPLIT_REGEX).filter(Boolean)[0] ?? undefined;
  const hasProperArgument = argument?.startsWith('@') && parseInt(argument?.slice(1)) === client.currentSubscriber.id;
  const isDeveloper = client.config.framework.developer === command.sourceSubscriberId;

  if (argument && !hasProperArgument) { return false; }

  if (!(isDeveloper || (hasProperArgument && await client.utility.subscriber.privilege.has(command.sourceSubscriberId, [Privilege.STAFF, Privilege.VOLUNTEER])) || await client.utility.subscriber.privilege.has(command.sourceSubscriberId, [Privilege.STAFF]))) { return false; }

  const displayDeveloperDetails = !!client.config.framework.developer;
  const displayOwnerDetails = !!client.config.framework.owner;

  const phrase = !displayDeveloperDetails && !displayOwnerDetails
    ? 'basic'
    : displayDeveloperDetails && displayOwnerDetails
      ? 'both'
      : displayDeveloperDetails
        ? 'developer'
        : 'owner';

  return await command.reply(
    client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_${client._frameworkConfig.get('commandKey')}_${phrase}_message`),
      {
        version: JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'))).version,
        developerNickname: displayDeveloperDetails ? (await client.subscriber.getById(client.config.framework.developer)).nickname : '',
        developerId: displayDeveloperDetails ? client.config.framework.developer : '',

        ownerNickname: displayOwnerDetails ? (await client.subscriber.getById(client.config.framework.owner)).nickname : '',
        ownerId: displayOwnerDetails ? client.config.framework.owner : ''
      }
    ),
    {
      formatting: {
        includeEmbeds: false
      }
    }

  );
};
