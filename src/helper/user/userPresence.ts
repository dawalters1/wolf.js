import { Command } from '../../constants/Command';
import { User } from '../../structures/user';
import UserPresence, { ServerUserPresence } from '../../structures/userPresence';
import { UserPresenceOptions } from '../../options/requestOptions';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';

class UserPresenceHelper {
  readonly client: WOLF;

  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number, opts?: UserPresenceOptions): Promise<UserPresence | null> {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds: number[], opts?: UserPresenceOptions): Promise<(UserPresence | null)[]> {
    const presenceMap = new Map<number, UserPresence>();

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    const subscribe = opts?.subscribe ?? true;

    if (!opts?.forceNew) {
      const cachedPresence = users.filter((user): user is User => user !== null && subscribe ? user?._presence.subscribed : true);
      cachedPresence.forEach((user) => presenceMap.set(user.id, user?._presence));
    }

    const idsToFetch = userIds.filter((id) => !presenceMap.has(id));

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerUserPresence>>>(
        Command.SUBSCRIBER_PRESENCE,
        {
          body: {
            idList: idsToFetch,
            subscribe
          }
        }
      );

      [...response.body.entries()].filter(([, presenceResponse]) => presenceResponse.success)
        .forEach(([userId, presenceResponse]) => {
          const user = users.find((user) => user?.id === userId) as User;

          user._presence?.patch(presenceResponse.body);
          user._presence.subscribed = subscribe;

          presenceMap.set(userId, user._presence);
        });
    }

    return userIds.map((userId) => presenceMap.get(userId) ?? null);
  }
}

export default UserPresenceHelper;
