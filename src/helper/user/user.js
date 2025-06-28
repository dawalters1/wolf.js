import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import CurrentUser from '../../entities/currentUser.js';
import Search from '../../entities/search.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../entities/user.js';
import UserPresenceHelper from './userPresence.js';
import UserRoleHelper from './userRole.js';
import WOLFStarHelper from './wolfstar.js';

class UserHelper extends BaseHelper {
  constructor (client) {
    super(client);
    this.wolfstar = new WOLFStarHelper(client);
    this.role = new UserRoleHelper(client);
    this.presence = new UserPresenceHelper(client);
  }

  async getById (userId, opts) {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    const usersMap = new Map();

    if (!opts?.forceNew) {
      const cachedUsers = this.cache.getAll(userIds)
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

          const user = existing
            ? existing.patch(userResponse.body)
            : userId === this.client.config.framework.login.userId
              ? new CurrentUser(this.client, userResponse.body)
              : new User(this.client, userResponse.body);

          if (user instanceof CurrentUser) {
            this.client._me = user;
          }

          usersMap.set(userId, this.cache.set(user));
        });
    }

    return userIds.map((userId) => usersMap.get(userId) ?? null);
  }

  async search (query) {
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
