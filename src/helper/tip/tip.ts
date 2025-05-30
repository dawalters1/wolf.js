import { Command } from '../../constants/Command.ts';
import BaseHelper from '../baseHelper.ts';
import TipContext from '../../structures/tipContext.ts';
import TipCharm from '../../structures/tipCharm.ts';

class TipHelper extends BaseHelper<any> {
  async tip (channelId: number, userId: number, context: TipContext, charms: TipCharm[]) {
    return await this.client.websocket.emit(
      Command.TIP_ADD,
      {
        subscriberId: userId,
        groupId: channelId,
        charmList: charms,
        context
      });
  }

  async getDetails (channelId: number, timestamp: number, limit?: 20, offset?: 0) {

  }
}

export default TipHelper;
