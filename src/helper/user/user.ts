import BaseHelper from '../baseHelper';
import { Command } from '../../constants/Command';
import CurrentUser from '../../structures/currentUser';
import { ServerUser, User } from '../../structures/user';
import { UserOptions } from '../../options/requestOptions';
import UserPresenceHelper from './userPresence';
import UserRoleHelper from './userRole';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';
import WOLFStarHelper from './wolfstar';

class UserHelper extends BaseHelper<User> {
  readonly wolfstar: WOLFStarHelper;
  readonly role: UserRoleHelper;
  readonly presence: UserPresenceHelper;

  constructor (client: WOLF) {
    super(client);

    this.wolfstar = new WOLFStarHelper(client);
    this.role = new UserRoleHelper(client);
    this.presence = new UserPresenceHelper(client);
  }

  async getById (userId: number, opts?: UserOptions): Promise<User | null> {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds: number[], opts?: UserOptions): Promise<(User | null)[]> {
    const usersMap = new Map<number, User | null>();

    // User is not requesting new data from server
    if (!opts?.forceNew) {
      const cachedUsers = this.cache.getAll(userIds)
        .filter((user): user is User => user !== null);

      cachedUsers.forEach((user) => usersMap.set(user.id, user));
    }

    const missingIds = userIds.filter((id) => !usersMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerUser>>>(
        Command.SUBSCRIBER_PROFILE,
        {
          headers: {
            version: 4
          },
          body: {
            idList: missingIds,
            subscribe: opts?.subscribe ?? true,
            extended: opts?.extended ?? true
          }
        }
      );

      [...response.body.values()].filter((userResponse) => userResponse.success)
        .forEach((userResponse) => {
          const user = userResponse.body.id === this.client.config.framework.login.userId
            ? new CurrentUser(this.client, userResponse.body)
            : new User(this.client, userResponse.body);

          if (user instanceof CurrentUser) {
            this.client._me = user;
          }

          usersMap.set(userResponse.body.id, this.cache.set(user));
        });
    }

    return userIds.map((userId) => usersMap.get(userId) ?? null);
  }
}

export default UserHelper;
