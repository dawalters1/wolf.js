import BaseHelper from '../BaseHelper.js';
import UserFollow from '../../entities/UserFollow.js';
import UserFollower from '../../entities/UserFollower.js';
import UserFollowerType from '../../constants/UserFollowType.js';
import UserPrivilege from '../../constants/UserPrivilege.js';
import { validate } from '../../validation/Validation.js';

export default class UserFollowHelper extends BaseHelper {
  constructor (client) {
    super(client);

    return {
      following: {
        count: async (...args) => this.#count(args[0], UserFollowerType.FOLLOWING, args[1]),
        follow: async (...args) => this.#follow(args[0]),
        fetch: async (...args) => this.#fetch(UserFollowerType.FOLLOWING, args[0]),
        unfollow: async (...args) => this.#unfollow(args[0]),
        update: async (...args) => this.#update(args[0], args[1])
      },
      follower: {
        count: async (...args) => this.#count(args[0], UserFollowerType.FOLLOWING, args[1]),
        fetch: async (...args) => this.#fetch(UserFollowerType.FOLLOWING, args[0])
      }
    };
  }

  async #count (userId, followDirection, opts) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    const user = await this.client.user.fetch(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} Not Found`); }

    if (followDirection === UserFollowerType.FOLLOWER && !user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) {
      throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`);
    }

    if (!opts?.forceNew && user.followStore[followDirection].count.fetched) {
      return user.followStore[followDirection].count.value;
    }

    const response = await this.client.websocket.emit(
      followDirection === UserFollowerType.FOLLOWER
        ? 'subscriber follower count'
        : 'subscriber follow count',
      {
        body: {
          subscriberId: userId
        }
      }
    );

    user.followStore[followDirection].count.value = response.body.total;

    return user.followStore[followDirection].count.value;
  }

  async #fetch (followDirection, opts) {
    validate(opts, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean(),

          subscribe: validator => validator
            .isNotRequired()
            .isBoolean()
        }
      );

    if (followDirection === UserFollowerType.FOLLOWER && !this.client.me.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) {
      throw new Error('Bot is not WOLFStar PRO or a Content Creator');
    }

    if (!opts?.forceNew && this.client.me.followStore[followDirection].list.fetched) {
      return this.client.me.followStore[followDirection].list.values();
    }

    const batch = async (results = []) => {
      const response = await this.client.websocket.emit(
        followDirection === UserFollowerType.FOLLOWER
          ? 'subscriber follower list'
          : 'subscriber follow list',
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
        : await batch(results);
    };

    this.client.me.followStore[followDirection].list.fetched = true;

    return (await batch()).map((serverFollowData) => {
      const existing = this.client.me.followStore[followDirection].list.get(serverFollowData.id);

      return this.client.me.followStore[followDirection].list.set(
        existing?.patch(serverFollowData) ??
           followDirection === UserFollowerType.FOLLOWER
          ? new UserFollower(this.client, serverFollowData)
          : new UserFollow(this.client, serverFollowData)
      );
    });
  }

  async #follow (userId) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const user = await this.client.user.getById(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} Not Found`); }

    if (!user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) { throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`); }

    return await this.client.websocket.emit(
      'subscriber follow add',
      {
        body: {
          subscriberId: normalisedUserId
        }
      }
    );
  }

  async #unfollow (userId) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const user = await this.client.user.getById(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} Not Found`); }

    if (!user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) { throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`); }

    return await this.client.websocket.emit(
      'subscriber follow delete',
      {
        body: {
          subscriberId: normalisedUserId
        }
      }
    );
  }

  async #update (userId, config) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.fetch)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(config, this, this.fetch)
      .isNotRequired()
      .forEachProperty(
        {
          notificationState: validator => validator
            .isBoolean()
        }
      );

    const user = await this.client.user.getById(normalisedUserId);

    if (user === null) { throw new Error(`User with ID ${normalisedUserId} Not Found`); }

    if (!user.privilegeList.some((userPrivilege) => userPrivilege === UserPrivilege.CONTENT_CREATOR || userPrivilege === UserPrivilege.WOLFSTAR_PRO)) { throw new Error(`User with ID ${userId} is not WOLFStar PRO or a Content Creator`); }

    return await this.client.websocket.emit(
      'subscriber follow update',
      {
        body: {
          subscriberId: normalisedUserId,
      ***REMOVED*** config.notificationState
        }
      }
    );
  }
}
