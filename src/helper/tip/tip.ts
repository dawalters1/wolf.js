import BaseHelper from '../baseHelper.ts';
import { Command } from '../../constants/Command.ts';
import { ContextType, TipDirection, TipPeriod, TipType } from '../../constants';
import { StatusCodes } from 'http-status-codes';
import TipCharm from '../../structures/tipCharm.ts';
import TipContext from '../../structures/tipContext.ts';
import TipDetail, { ServerTipDetail } from '../../structures/tipDetail';
import TipLeaderboard, { ServerTipLeaderboard } from '../../structures/tipLeaderboard';
import TipLeaderboardSummary, { ServerTipLeaderboardSummary } from '../../structures/tipLeaderboardSummary';
import TipSummary, { ServerTipSummary } from '../../structures/tipSummary';
import WOLFResponse from '../../structures/WOLFResponse';

class TipHelper extends BaseHelper<any> {
  async tip (channelId: number, userId: number, context: TipContext, charms: TipCharm[]) {
    return await this.client.websocket.emit(
      Command.TIP_ADD,
      {
        body: {
          subscriberId: userId,
          groupId: channelId,
          charmList: charms,
          context
        }
      }
    );
  }

  async getDetails (channelId: number, timestamp: number, offset?: 0, limit?: 20) {
    try {
      const response = await this.client.websocket.emit<ServerTipDetail>(
        Command.TIP_DETAIL,
        {
          body: {
            groupId: channelId,
            id: timestamp,
            contextType: ContextType.MESSAGE,
            offset,
            limit
          }
        }
      );

      return new TipDetail(this.client, response.body);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async getSummary (channelId: number, timestamp: number): Promise<TipSummary | null> {
    return (await this.getSummaries(channelId, [timestamp]))[0];
  }

  async getSummaries (channelId: number, timestamps: number[]): Promise<(TipSummary | null)[]> {
    const response = await this.client.websocket.emit<Map<number, WOLFResponse<ServerTipSummary>>>(
      Command.TIP_SUMMARY,
      {
        body: {
          groupId: channelId,
          idList: timestamps,
          contextType: ContextType.MESSAGE
        }
      }
    );

    return [...response.body.entries()]
      .map(([, tipSummaryResponse]) => tipSummaryResponse.success ? new TipSummary(this.client, tipSummaryResponse.body) : null);
  }

  async getChannelLeaderboard (channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection) {
    if (tipType !== TipType.CHARM) {
      if (tipDirection === undefined) {
        throw new Error('TipDirection must be provided when requesting: CHANNEL or USER');
      }
    } else if (tipDirection !== undefined) {
      throw new Error('TipDirection cannot be provided when requesting: CHARM');
    }

    try {
      const response = await this.client.websocket.emit<ServerTipLeaderboard>(
        Command.TIP_LEADERBOARD_GROUP,
        {
          body: {
            groupId: channelId,
            period: tipPeriod,
            type: tipType,
            tipDirection
          }
        }
      );

      return new TipLeaderboard(this.client, response.body);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }

      throw error;
    }
  }

  async getChannelleaderboardSummary (channelId: number, tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection) {
    if (tipType !== TipType.CHARM) {
      if (tipDirection === undefined) {
        throw new Error('TipDirection must be provided when requesting: CHANNEL or USER');
      }
    } else if (tipDirection !== undefined) {
      throw new Error('TipDirection cannot be provided when requesting: CHARM');
    }

    try {
      const response = await this.client.websocket.emit<ServerTipLeaderboardSummary>(
        Command.TIP_LEADERBOARD_GROUP_SUMMARY,
        {
          body: {
            groupId: channelId,
            period: tipPeriod,
            type: tipType,
            tipDirection
          }
        }
      );

      return new TipLeaderboardSummary(this.client, response.body);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }

      throw error;
    }
  }

  async getGlobalLeaderboard (tipPeriod: TipPeriod, tipType: TipType, tipDirection?: TipDirection) {
    if (tipType === TipType.CHARM) {
      throw new Error('TipType CHARM is not supported in Global leaderboards');
    }

    if (tipType === TipType.USER) {
      if (tipDirection !== undefined) {
        throw new Error('TipDirection cannot be provided when requesting: USER');
      }
    }

    try {
      const response = await this.client.websocket.emit<ServerTipLeaderboard>(
        Command.TIP_LEADERBOARD_GLOBAL,
        {
          body: {
            period: tipPeriod,
            type: tipType,
            tipDirection
          }
        }
      );

      return new TipLeaderboard(this.client, response.body);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }

      throw error;
    }
  }

  async getGlobalLeaderboardSummary (tipPeriod: TipPeriod) {
    try {
      const response = await this.client.websocket.emit<ServerTipLeaderboardSummary>(
        Command.TIP_LEADERBOARD_GLOBAL_SUMMARY,
        {
          body: {
            period: tipPeriod
          }
        }
      );

      return new TipLeaderboardSummary(this.client, response.body);
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return [];
      }

      throw error;
    }
  }
}

export default TipHelper;
