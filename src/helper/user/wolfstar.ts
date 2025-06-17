import { Command } from '../../constants/Command';
import { User } from '../../structures/user';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';
import WOLFStar, { ServerWOLFStar } from '../../structures/wolfstar';
import { WOLFStarOptions } from '../../options/requestOptions';

class WOLFStarHelper {
  readonly client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number, opts?: WOLFStarOptions): Promise<WOLFStar | null> {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds: number[], opts?: WOLFStarOptions): Promise<(WOLFStar | null)[]> {
    const wolfStarMap = new Map<number, WOLFStar | null>();

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    if (!opts?.forceNew) {
      const cachedWOLFStar = users.filter((user): user is User => user !== null && user._wolfstars.fetched);

      cachedWOLFStar.forEach(user => {
        wolfStarMap.set(user.id, user._wolfstars.value);
      });
    }

    const idsToFetch = userIds.filter(id => !wolfStarMap.has(id));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerWOLFStar>>>(
        Command.WOLFSTAR_PROFILE,
        {
          headers: {
            version: 2
          },
          body: {
            idList: idsToFetch
          }
        }
      );

      [...response.body.entries()]
        .filter(([, wolfStarResponse]) => wolfStarResponse.success)
        .forEach(([userId, wolfStarResponse]) => {
          const user = users.find(user => user?.id === userId) as User;

          user._wolfstars.value =
            user._wolfstars.value?.patch(wolfStarResponse.body) ??
            new WOLFStar(this.client, wolfStarResponse.body);

          wolfStarMap.set(user.id, user._wolfstars.value);
        });
    }

    return userIds.map(userId => wolfStarMap.get(userId) ?? null);
  }
}

export default WOLFStarHelper;
