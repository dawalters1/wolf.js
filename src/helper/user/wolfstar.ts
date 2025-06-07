import { Command } from '../../constants/Command';
import WOLF from '../../client/WOLF';
import WOLFResponse from '../../structures/WOLFResponse';
import WOLFStar, { ServerWOLFStar } from '../../structures/wolfstar';

class WOLFStarHelper {
  readonly client: WOLF;
  constructor (client: WOLF) {
    this.client = client;
  }

  async getById (userId: number): Promise<WOLFStar | null> {
    return (await this.getByIds([userId]))[0];
  }

  async getByIds (userIds: number[]): Promise<(WOLFStar | null)[]> {
    const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerWOLFStar>>>(
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

    return [...response.body.values()].map((serverWOLFStarResponse) => serverWOLFStarResponse.success ? new WOLFStar(this.client, serverWOLFStarResponse.body) : null);
  }
}

export default WOLFStarHelper;
