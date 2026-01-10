import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import CurrentUser from '../../entities/currentUser.js';
import Search from '../../entities/search.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../entities/user.js';
import UserFollowerHelper from './follwers.js';
import UserPresenceHelper from './userPresence.js';
import UserRoleHelper from './userRole.js';
import { validate } from '../../validator/index.js';
import WOLFStarHelper from './wolfstar.js';

class UserHelper extends BaseHelper {
  #followers;
  #wolfstar;
  #role;
  #presence;

  constructor (client) {
    super(client);
    this.#followers = new UserFollowerHelper(client);
    this.#wolfstar = new WOLFStarHelper(client);
    this.#role = new UserRoleHelper(client);
    this.#presence = new UserPresenceHelper(client);
  }

  get followers () {
    return this.#followers;
  }

  get wolfstar () {
    return this.#wolfstar;
  }

  get role () {
    return this.#role;
  }

  get presence () {
    return this.#presence;
  }

  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `UserHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserHelper.getById() parameter, opts.{parameter}: {value} {error}');
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isArray(`UserHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'UserHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject({ subscribe: Boolean, forceNew: Boolean }, 'UserHelper.getByIds() parameter, opts.{parameter}: {value} {error}');
    }

    const idsToFetch = opts?.forceNew
      ? userIds
      : userIds.filter((userId) => !this.store.has((user) => user.id === userId));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        Command.SUBSCRIBER_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            idList: idsToFetch,
            subscribe: opts?.subscribe ?? true,
            extended: opts?.extended ?? true
          }
        }
      );

      for (const [userId, userResponse] of response.body.entries()) {
        if (!userResponse.success) {
          this.store.delete((user) => user.id === userId);
          continue;
        }

        const user = userId === this.client.config.framework.login.userId
          ? new CurrentUser(this.client, userResponse.body)
          : new User(this.client, userResponse.body);

        if (user instanceof CurrentUser) {
          this.client.me = user;
        }

        this.store.set(
          user,
          response.headers?.maxAge
        );
      }
    }

    return userIds.map((userId) =>
      this.store.get((user) => user.id === userId)
    );
  }

  async search (query) {
    { // eslint-disable-line no-lone-blocks
      validate(query)
        .isNotNullOrUndefined(`UserHelper.search() parameter, query: ${query} is null or undefined`)
        .isNotEmptyOrWhitespace(`UserHelper.search() parameter, query: ${query} is empty or whitespace`);
    }
    try {
      const response = await this.client.websocket.emit(
        Command.SEARCH,
        {
          body: {
            query,
            types: ['related']
          }
        }
      );

      return response.body?.map((serverSearch) => new Search(this.client, serverSearch));
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }
      throw error;
    }
  }
}

export default UserHelper;
