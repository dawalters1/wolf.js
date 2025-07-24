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
  constructor (client) {
    super(client);
    this.followers = new UserFollowerHelper(client);
    this.wolfstar = new WOLFStarHelper(client);
    this.role = new UserRoleHelper(client);
    this.presence = new UserPresenceHelper(client);
  }

  async getById (userId, opts) {
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(userId)
        .isNotNullOrUndefined(`UserHelper.getById() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`UserHelper.getById() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThanZero(`UserHelper.getById() parameter, userId: ${userId} is less than or equal to zero`);

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }

    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    userIds = userIds.map((userId) => Number(userId) || userId);

    { // eslint-disable-line no-lone-blocks
      validate(userIds)
        .isValidArray(`UserHelper.getByIds() parameter, userIds: ${userIds} is not a valid array`)
        .each()
        .isNotNullOrUndefined('UserHelper.getByIds() parameter, userId[{index}]: {value} is null or undefined')
        .isValidNumber('UserHelper.getByIds() parameter, userId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('UserHelper.getByIds() parameter, userId[{index}]: {value} is less than or equal to zero');

      validate(opts)
        .isNotRequired()
        .isValidObject();
    }
    const usersMap = new Map();

    if (!opts?.forceNew) {
      const cachedUsers = userIds.map((userId) => this.cache.get(userId))
        .filter((user) => user !== null);

      cachedUsers.forEach((user) => usersMap.set(user.id, user));
    }

    const idsToFetch = userIds.filter((id) => !usersMap.has(id));

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

      [...response.body.entries()].filter(([, userResponse]) => userResponse.success)
        .forEach(([userId, userResponse]) => {
          const existing = this.cache.get(userId);

          console.log(existing);
          const user = existing
            ? existing?.patch(userResponse.body)
            : userId === this.client.config.framework.login.userId
              ? new CurrentUser(this.client, userResponse.body)
              : new User(this.client, userResponse.body);

          if (user instanceof CurrentUser) {
            this.client._me = user;
          }

          usersMap.set(
            userId,
            this.cache.set(
              user,
              response.headers?.maxAge
            )
          );
        });
    }

    return userIds.map((userId) => usersMap.get(userId) ?? null);
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
