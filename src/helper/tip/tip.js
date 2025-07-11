import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { ContextType, TipType } from '../../constants/index.js';
import { StatusCodes } from 'http-status-codes';
import TipDetail from '../../entities/tipDetail.js';
import TipLeaderboard from '../../entities/tipLeaderboard.js';
import TipLeaderboardSummary from '../../entities/tipLeaderboardSummary.js';
import TipSummary from '../../entities/tipSummary.js';

class TipHelper extends BaseHelper {
  async tip (channelId, userId, context, charms) {
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

  async getDetails (channelId, timestamp, offset = 0, limit = 20) {
    try {
      const response = await this.client.websocket.emit(
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

  async getSummary (channelId, timestamp) {
    return (await this.getSummaries(channelId, [timestamp]))[0];
  }

  async getSummaries (channelId, timestamps) {
    const response = await this.client.websocket.emit(
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
      .map(([, tipSummaryResponse]) => tipSummaryResponse.success
        ? new TipSummary(this.client, tipSummaryResponse.body)
        : null);
  }

  async getChannelLeaderboard (channelId, tipPeriod, tipType, tipDirection) {
    if (tipType !== TipType.CHARM && tipDirection === undefined) {
      throw new Error('TipDirection must be provided when requesting: CHANNEL or USER');
    }
    if (tipType === TipType.CHARM && tipDirection !== undefined) {
      throw new Error('TipDirection cannot be provided when requesting: CHARM');
    }

    try {
      const response = await this.client.websocket.emit(
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

  async getChannelleaderboardSummary (channelId, tipPeriod, tipType, tipDirection) {
    if (tipType !== TipType.CHARM && tipDirection === undefined) {
      throw new Error('TipDirection must be provided when requesting: CHANNEL or USER');
    }
    if (tipType === TipType.CHARM && tipDirection !== undefined) {
      throw new Error('TipDirection cannot be provided when requesting: CHARM');
    }

    try {
      const response = await this.client.websocket.emit(
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

  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection) {
    if (tipType === TipType.CHARM) {
      throw new Error('TipType CHARM is not supported in Global leaderboards');
    }
    if (tipType === TipType.USER && tipDirection !== undefined) {
      throw new Error('TipDirection cannot be provided when requesting: USER');
    }

    try {
      const response = await this.client.websocket.emit(
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

  async getGlobalLeaderboardSummary (tipPeriod) {
    try {
      const response = await this.client.websocket.emit(
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
