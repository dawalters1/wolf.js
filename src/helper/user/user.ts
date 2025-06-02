import BaseHelper from '../baseHelper';
import { Command } from '../../constants/Command';
import { User } from '../../structures/user';
import { UserOptions } from '../../options/requestOptions';
import UserRoleHelper from './userRole';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';
import WOLFStarHelper from './wolfstar';

class UserHelper extends BaseHelper<User> {
  wolfstar: Readonly<WOLFStarHelper>;
  role: Readonly<UserRoleHelper>;

  constructor (client: WOLF) {
    super(client);

    this.wolfstar = new WOLFStarHelper(client);
    this.role = new UserRoleHelper(client);
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
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<User>>>(
        Command.SUBSCRIBER_PROFILE,
        {
          body: {
            idList: missingIds,
            subscribe: opts?.subscribe ?? true,
            extended: opts?.extended ?? true
          }
        }
      );

      response.body.values().filter((userResponse) => userResponse.success)
        .forEach((userResponse) => usersMap.set(userResponse.body.id, this.cache.set(userResponse.body)));
    }

    return userIds.map((userId) => usersMap.get(userId) ?? null);
  }
}

export default UserHelper;
