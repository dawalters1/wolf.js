// subscriber-follow-add
// subscriber-follow-delete
// subscriber-follow-update
// subscriber-follow-count
// subscriber-follower-count
// subscriber-follow-list
// subscriber-follower-list

import Command from '../../constants/Command.js';
import UserFollow from '../../entities/userFollow.js';
import UserFollower from '../../entities/userFollower.js';
import UserFollowerType from '../../constants/UserFollowType.js';
import UserPrivilege from '../../constants/UserPrivilege.js';
import { validate } from '../../validator/index.js';

class UserFollowerHelper {
  constructor (client) {
    this.client = client;
  }

  async count (userId, followDirection, opts) {
    userId = Number(userId) || userId;
    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserFollowerHelper.count() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserFollowerHelper.count() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserFollowerHelper.count() parameter, userId: ${userId} is less than or equal to zero`);

      validate(followDirection)
        .isNotNullOrUndefined(`UserFollowerHelper.count() parameter, followDirection: ${followDirection} is null or undefined`)
        .isValidConstant(UserFollowerType, `UserFollowerHelper.count() parameter, followDirection: ${followDirection} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserFollowerHelper.count() parameter, opts.{parameter}: {value} {error}');
    }
    const user = await this.client.user.getById(userId);

    if (user === null) { throw new Error(); }

    if (followDirection === UserFollowerType.FOLLOWER && !user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) {
      throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`);
    }

    if (!opts?.forceNew && user._follow[followDirection].count._fetched) {
      return user._follow[followDirection].count.value;
    }

    const response = await this.client.websocket.emit(
      followDirection === UserFollowerType.FOLLOWER
        ? Command.SUBSCRIBER_FOLLOWER_COUNT
        : Command.SUBSCRIBER_FOLLOW_COUNT,
      {
        body: {
          subscriberId: userId
        }
      }
    );

    user._follow[followDirection].count.value = response.body.total;

    return user._follow[followDirection].count.value;
  }

  async list (followDirection, opts) {
    { // eslint-disable-line no-lone-blocks
      validate(followDirection)
        .isNotNullOrUndefined(`UserFollowerHelper.list() parameter, followDirection: ${followDirection} is null or undefined`)
        .isValidConstant(UserFollowerType, `UserFollowerHelper.list() parameter, followDirection: ${followDirection} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserFollowerHelper.list() parameter, opts.{parameter}: {value} {error}');
    }
    if (followDirection === UserFollowerType.FOLLOWER && !this.client.me.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) {
      throw new Error('Bot is not WOLFStar PRO or a Content Creator');
    }

    if (!opts?.forceNew && this.client.me._follow[followDirection].list._fetched) {
      return this.client.me._follow[followDirection].list.values();
    }

    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
        followDirection === UserFollowerType.FOLLOWER
          ? Command.SUBSCRIBER_FOLLOWER_LIST
          : Command.SUBSCRIBER_FOLLOW_LIST,
        {
          body: {
            subscribe: opts?.subscribe ?? true,
            limit: 50,
            offset: results.length
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await get(results);
    };

    this.client.me._follow[followDirection].list.fetched = true;

    return (await get()).map((serverFollowData) => {
      const existing = this.client.me._follow[followDirection].list.get(serverFollowData.id);

      return this.client.me._follow[followDirection].list.set(
        existing?.patch(serverFollowData) ??
           followDirection === UserFollowerType.FOLLOWER
          ? new UserFollower(this.client, serverFollowData)
          : new UserFollow(this.client, serverFollowData)
      );
    });
  }

  async follow (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserFollowerHelper.follow() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserFollowerHelper.follow() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserFollowerHelper.follow() parameter, userId: ${userId} is less than or equal to zero`);
    }
    const user = await this.client.user.getById(userId);

    if (user === null) { throw new Error(); }

    if (!user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) { throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`); }

    const followingList = await this.list(UserFollowerType.FOLLOWING);

    if (followingList.some((following) => following.userId === userId)) { throw new Error(`User with ID ${userId} is already followed`); }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_FOLLOW_ADD,
      {
        body: {
          subscriberId: userId
        }
      }
    );
  }

  async unfollow (userId) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserFollowerHelper.unfollow() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserFollowerHelper.unfollow() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserFollowerHelper.unfollow() parameter, userId: ${userId} is less than or equal to zero`);
    }

    const user = await this.client.user.getById(userId);

    if (user === null) { throw new Error(); }

    const followingList = await this.list(UserFollowerType.FOLLOWING);

    if (!followingList.some((following) => following.userId === userId)) { throw new Error(`User with ID ${userId} is not followed`); }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_FOLLOW_DELETE,
      {
        body: {
          subscriberId: userId
        }
      }
    );
  }

  async update (userId, notificationState) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserFollowerHelper.update() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserFollowerHelper.update() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserFollowerHelper.update() parameter, userId: ${userId} is less than or equal to zero`);

      validate(notificationState)
        .isBoolean(`UserFollowerHelper.update() parameter, notificationState: ${notificationState} is not a valid boolean`);
    }

    const user = await this.client.user.getById(userId);

    if (user === null) { throw new Error(); }

    const followingList = await this.list(UserFollowerType.FOLLOWING);

    if (!followingList.some((following) => following.userId === userId)) { throw new Error(`User with ID ${userId} is not followed`); }

    return await this.client.websocket.emit(
      Command.SUBSCRIBER_FOLLOW_UPDATE,
      {
        body: {
          subscriberId: userId,
          notification: notificationState
        }
      }
    );
  }
}

export default UserFollowerHelper;
