import validator from '../../validator/index.js';
import { JoinLockType } from '../../constants/index.js';

const canBypass = async (client, required, subscriberId) => {
  switch (required) {
    case JoinLockType.DEVELOPER:
      return client.config.framework.developer === subscriberId;
    default:
      return client.config.framework.developer === subscriberId || await client.authorization.isAuthorized(subscriberId);
  }
};

/**
 * @param {import('../../client/WOLF.js').default} client
 * @param {import('../../models/CommandContext.js').default} command
 */
export default async (client, command, onPermissionErrorCallback) => {
  const args = command.argument.split(client.SPLIT_REGEX);

  const joinConfiguration = client.config.get('framework.join');

  const bypassChecks = await canBypass(client, joinConfiguration.lock, command.sourceSubscriberId);

  if (!bypassChecks && ![JoinLockType.EVERYONE, JoinLockType.GROUP_OWNER].includes(joinConfiguration.lock)) {
    if (!validator.isNullOrUndefined(onPermissionErrorCallback)) {
      return onPermissionErrorCallback();
    }

    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_permission_${joinConfiguration.lock}${joinConfiguration.lock === JoinLockType.DEVELOPER ? `_with${client.config.framework.developer ? '' : 'out'}_details` : ''}_message`),
        {
          developerNickname: joinConfiguration.lock === JoinLockType.DEVELOPER && client.config.framework.developer ? (await client.subscriber.getById(client.config.framework.developer)).nickname : '',
          developerSubscriberId: joinConfiguration.lock === JoinLockType.DEVELOPER && client.config.framework.developer ? client.config.framework.developer : '',
          nickname: (await command.subscriber()).nickname,
          subscriberId: command.sourceSubscriberId
        }
      )
    );
  }

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

  if (!bypassChecks && joinConfiguration.lock === JoinLockType.GROUP_OWNER && group.owner.id !== command.sourceSubscriberId) {
    if (!validator.isNullOrUndefined(onPermissionErrorCallback)) {
      return onPermissionErrorCallback();
    }

    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_permission_${joinConfiguration.lock}_message`),
        {
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

  if (group.membersCount < joinConfiguration.members.min || group.membersCount > joinConfiguration.members.max) {
    return command.reply(
      client.utility.string.replace(client.phrase.getByLanguageAndName(command.language, `${client.config.keyword}_join_group_error_too_${group.membersCount < joinConfiguration.members.min ? 'few' : 'many'}_members_message`),
        {
          minimum: client.utility.number.addCommas(joinConfiguration.members.min),
          maximum: client.utility.number.addCommas(joinConfiguration.members.max),

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
