import BaseHelper from '../baseHelper';
import { Command } from '../../constants/Command';
import WOLFResponse from '../../structures/WOLFResponse';
import WOLFStar from '../../structures/wolfstar';

// Nothing gets cached from this.
// Should I cache?, IDK yet
class WOLFStarHelper extends BaseHelper<WOLFStar> {
  async getById (userId: number): Promise<WOLFStar | null> {
    return (await this.getByIds([userId]))[0];
  }

  async getByIds (userIds: number[]): Promise<(WOLFStar | null)[]> {
    const response = await this.client.websocket.emit<Map<number, WOLFResponse<WOLFStar>>>(
      Command.WOLFSTAR_PROFILE,
      {
        headers: {
          version: 2
        },
        body: {
          idList: userIds
        }
      }
    );

    return [...response.body.values()].map((value) => value?.body ?? null);
  }
}

export default WOLFStarHelper;
