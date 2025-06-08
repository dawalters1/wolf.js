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

    const subscribe = opts?.subscribe ?? true;

    const users = await this.client.user.getByIds(userIds);

    if (!opts?.forceNew) {
      const cachedPresence = users.filter((user): user is User => user !== null && subscribe ? user?.presence.subscribed : true);

      cachedPresence.forEach((user) => presenceMap.set(user.id, user?.presence));
    }

    const missingIds = userIds.filter((id) => !presenceMap.has(id));

    if (missingIds.length) {
      const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerUserPresence>>>(
        Command.SUBSCRIBER_PRESENCE,
        {
          body: {
            idList: missingIds,
            subscribe
          }
        }
      );

      [...response.body.entries()].filter(([userId, presenceResponse]) => presenceResponse.success)
        .forEach(([userId, presenceResponse]) => {
          const user = users.find((user) => user?.id === userId) ?? null;
          if (user === null) { return; }
          user.presence?.patch(presenceResponse.body);
          user.presence.subscribed = subscribe;
          presenceMap.set(userId, user.presence);
        });
    }

    return userIds.map((userId) => presenceMap.get(userId) ?? null);
  }
}

export default UserPresenceHelper;
