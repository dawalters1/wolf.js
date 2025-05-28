
/*
import { Command } from '../../constants/Command.ts';
import AchievementChannel from '../../structures/AchievementChannel.ts';
import Base from '../Base.ts';

class AchievementChannelHelper extends Base {
  // TODO: update to handle parentId implementation
  async get (channelId: number, parentId?: number, forceNew?: boolean) : Promise<AchievementChannel[]> {
    const channel = await this.client.channel.getById(channelId);

    if (channel === null) { throw new Error(''); }

    if (!forceNew) {
      // TODO
    }

    const response = await this.client.websocket.emit<AchievementChannel[]>(
      Command.ACHIEVEMENT_GROUP_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: channelId,
          parentId
        }
      }
    );

    channel.achievements.clear();

    return channel.achievements.mset(response.body);
  }
}

export default AchievementChannelHelper;
*/
