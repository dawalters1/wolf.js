import validator from '../../validator/index.js';

// TODO: finish implementation

/**
 * @param {import('../../models/CommandContext.js').default} command
 */
export default async (client, command) => {
  const args = command.argument.split(client.SPLIT_REGEX);

  if (!args.length) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_provide_arguments_message`),
        {
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  if (!validator.isValidNumber(args[0])) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_invalid_group_id_message`),
        {
          arg: args[0],
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const group = await client.group.getById(parseInt(args[0]));

  if (!group.exists) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_no_such_group_message`),
        {
          groupId: group.id,
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  if (group.inGroup) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_in_group_message`),
        {
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const reputationLevel = parseInt(client.currentSubscriber.reputation.toString().split('.')[0]);

  if (group.extended.entryLevel > reputationLevel) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_higher_reputation_message`),
        {
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId,
          reputationLevel
        }
      )
    );
  }

  if (group.extended.passworded && !args[1]) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_passworded_message`),
        {
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

  const response = await client.group.joinById(parseInt(args[0]), args[1]);

  return command.reply(
    client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_${response.success ? 'success' : 'failed'}_message`),
      {
        reason: response.success ? '' : response.headers?.message || client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_error_unknown_reason_message`),
        nickname: (await command.subscriber()).nickname,
        subscriberId: command.sourceSubscriberId
      }
    )
  );
};
