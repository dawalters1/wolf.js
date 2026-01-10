/* eslint-disable no-undef */
import BaseHelper from '../BaseHelper.js';
import { StatusCodes } from 'http-status-codes';
import UserPresenceHelper from './UserPresence.js';
import UserRoleHelper from './UserRole.js';
import WOLFStarHelper from './WOLFStar.js';

export default class UserHelper extends BaseHelper {
  #presence;
  #role;
  #wolfstar;

  constructor (client) {
    super(client);

    this.#presence = new UserPresenceHelper(client);
    this.#role = new UserRoleHelper(client);
    this.#wolfstar = new WOLFStarHelper(client);
  }

  get presence () {
    return this.#presence;
  }

  get role () {
    return this.#role;
  }

  get wolfstar () {
    return this.#wolfstar;
  }

  async fetch (userIds, opts) {
    const isArrayResponse = Array.isArray(userIds);

    const normalisedUserIds = this.normaliseNumbers(userIds);

    // TODO: validation

    const idsToFetch = opts?.forceNew
      ? normalisedUserIds
      : normalisedUserIds.filter((userId) => !this.store.has((item) => item.id === userId));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
        'subscriber profile',
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

      for (const [id, childResponse] of response.body.entries()) {
        if (!childResponse.success) {
          this.store.delete((item) => item.id === id);
          continue;
        }

        const user = id === this.client.config.framework.login.userId
          ? new CurrentUser(this.client, childResponse.body)
          : new User(this.client, childResponse.body);

        if (user instanceof CurrentUser) { this.client.me = user; }

        this.store.set(
          user,
          response.headers?.maxAge
        );
      }
    }

    const users = normalisedUserIds.map((userId) => this.store.get((item) => item.id === userId));

    return isArrayResponse
      ? users
      : users[0];
  }

  async search (query) {
    try {
      const response = await this.client.websocket.emit(
        'search',
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
