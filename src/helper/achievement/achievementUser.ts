/*
import { Command } from '../../constants/Command.ts';
import AchievementUser from '../../structures/AchievementUser.ts';
import Base from '../Base.ts';

class AchievementUserHelper extends Base {
  // TODO: update to handle parentId implementation
  async get (userId: number, parentId?: number, forceNew?: boolean) : Promise<AchievementUser[]> {
    const user = await this.client.channel.getById(userId);

    if (user === null) { throw new Error(''); }

    if (!forceNew && user.achievements.size()) {
      return user.achievements.values();
    }

    const response = await this.client.websocket.emit<AchievementUser[]>(
      Command.ACHIEVEMENT_SUBSCRIBER_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: userId,
          parentId
        }
      }
    );

    user.achievements.clear();

    return user.achievements.mset(response.body);
  }
}
export default AchievementUserHelper;
*/
