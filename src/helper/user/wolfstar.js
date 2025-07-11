import { Command } from '../../constants/Command.js';
import WOLFStar from '../../entities/wolfstar.js';

class WOLFStarHelper {
  constructor (client) {
    this.client = client;
  }

  async getById (userId, opts) {
    return (await this.getByIds([userId], opts))[0];
  }

  async getByIds (userIds, opts) {
    const wolfStarMap = new Map();

    const users = await this.client.user.getByIds(userIds);

    const missingUserIds = userIds.filter(
      userId => !users.some(user => user?.id === userId)
    );

    if (missingUserIds.length > 0) {
      throw new Error(`Users with IDs ${missingUserIds.join(', ')} not found`);
    }

    if (!opts?.forceNew) {
      const cachedWOLFStar = users.filter(user => user !== null && user._wolfstars?.fetched);
      cachedWOLFStar.forEach(user => wolfStarMap.set(user.id, user._wolfstars.value));
    }

    const idsToFetch = userIds.filter(id => !wolfStarMap.has(id));

    if (idsToFetch.length > 0) {
      const response = await this.client.websocket.emit(
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
          const user = users.find(user => user?.id === userId);

          if (user) {
            user._wolfstars.value = user._wolfstars.value?.patch(wolfStarResponse.body) ??
              new WOLFStar(this.client, wolfStarResponse.body);

            wolfStarMap.set(user.id, user._wolfstars.value);
          }
        });
    }

    return userIds.map(userId => wolfStarMap.get(userId) ?? null);
  }
}

export default WOLFStarHelper;
