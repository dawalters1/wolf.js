import path, { dirname } from 'path';
import fs from 'fs';
import { Privilege } from '../constants/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (client, command) => {
  if (command.sourceSubscriberId === client.currentSubscriber.id) {
    return Promise.resolve();
  }

  const argument = client.utility.number.toEnglishNumbers(command.argument)?.split(client.SPLIT_REGEX).filter(Boolean)[0] ?? undefined;
  const hasProperArgument = argument?.startsWith('@') && parseInt(argument?.slice(1)) === client.currentSubscriber.id;
  const isDeveloper = client.config.framework.developer === command.sourceSubscriberId;

  if (argument && !hasProperArgument) {
    return Promise.resolve();
  }

  if (!(isDeveloper || (hasProperArgument && await client.utility.subscriber.privilege.has(command.sourceSubscriberId, [Privilege.STAFF, Privilege.VOLUNTEER])) || await client.utility.subscriber.privilege.has(command.sourceSubscriberId, [Privilege.STAFF]))) {
    return Promise.resolve();
  }

  const displayDeveloperDetails = !!client.config.framework.developer;

  return await command.reply(
    client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_${client._frameworkConfig.get('commandKey')}_with${displayDeveloperDetails ? '' : 'out'}_details_message`),
      {
        version: JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'))).version,
        nickname: displayDeveloperDetails ? (await client.subscriber.getById(client.config.framework.developer)).nickname : '',
        subscriberId: displayDeveloperDetails ? client.config.framework.developer : ''
      }
    )
  );
};
