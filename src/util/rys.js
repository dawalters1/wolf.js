import { fileURLToPath } from 'url';
import fs from 'fs';
import path, { dirname } from 'path';
import { UserPrivilege } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * @param {import('../client/WOLF.js').default} client
 * @param {import('../entities/CommandContext.js').default} commandContext
 */
export default async (client, commandContext) => {
  if (client.config.framework.login.apiKey) { return false; }

  if (client.me.id === commandContext.sourceUserId) { return false; }

  const isTargetingBot = !commandContext.bodyParts.length || commandContext.bodyParts.some((bodyPart) => client.utility.number.toEnglishNumbers(bodyPart) === `@${client.me.id}`);

  if (!isTargetingBot) { return false; }

  if (client.config.framework.developerId !== commandContext.sourceUserId && !await commandContext.hasPrivilege([UserPrivilege.STAFF, UserPrivilege.VOLUNTEER])) { return false; }

  const displayDeveloperDetails = !!client.config.framework.developer;
  const displayOwnerDetails = !!client.config.framework.owner;

  const phrase = !displayDeveloperDetails && !displayOwnerDetails
    ? 'basic'
    : displayDeveloperDetails && displayOwnerDetails
      ? 'both'
      : displayDeveloperDetails
        ? 'developer'
        : 'owner';

  return await commandContext.reply(
    client.utility.string.replace(client.phrase.getByLanguageAndName(commandContext.language, `${client.config.keyword}_${client._frameworkConfig.get('commandKey')}_${phrase}_message`),
      {
        version: JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'))).version,
        developerNickname: displayDeveloperDetails
          ? (await client.user.fetch(client.config.framework.developer)).nickname
          : '',
        developerId: displayDeveloperDetails
          ? client.config.framework.developer
          : '',

        ownerNickname: displayOwnerDetails
          ? (await client.user.fetch(client.config.framework.owner)).nickname
          : '',
        ownerId: displayOwnerDetails
          ? client.config.framework.owner
          : ''
      }
    ),
    {
      formatting: {
        includeEmbeds: false
      }
    }
  );
};
