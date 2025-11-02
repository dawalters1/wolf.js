import BaseHelper from '../baseHelper.js';
import { Command } from '../../constants/Command.js';
import { ContextType, TipDirection, TipPeriod, TipType } from '../../constants/index.js';
import { StatusCodes } from 'http-status-codes';
import TipDetail from '../../entities/tipDetail.js';
import TipLeaderboard from '../../entities/tipLeaderboard.js';
import TipLeaderboardSummary from '../../entities/tipLeaderboardSummary.js';
import TipSummary from '../../entities/tipSummary.js';
import { validate } from '../../validator/index.js';

class TipHelper extends BaseHelper {
  async _subscribeToChannel () {
    return await this.client.websocket.emit(Command.TIP_GROUP_SUBSCRIBE);
  }

  async _unsubscribeToChannel () {
    return await this.client.websocket.emit(Command.TIP_GROUP_UNSUBSCRIBE);
  }

  async tip (channelId, userId, context, charms) {
    channelId = Number(channelId) || channelId;
    userId = Number(userId) || userId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.tip() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.tip() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.tip() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(userId)
        .isNotNullOrUndefined(`TipHelper.tip() parameter, userId: ${userId} is null or undefined`)
        .isValidNumber(`TipHelper.tip() parameter, userId: ${userId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.tip() parameter, userId: ${userId} is less than or equal to zero`);

      validate(context)
        .isValidObject({
          type: { __enum: ContextType },
          id: {
            type: Number,
            __required_if: { key: 'type', value: ContextType.MESSAGE },
            __not_required_if: { key: 'type', value: ContextType.STAGE }
          }
        }, 'EventHelper.getById() parameter, opts.{parameter}: {value} {error}');

      validate(charms)
        .isArray()
        .each()
        .isValidObject({ id: Number, quantity: Number }, 'EventHelper.tip() parameter, opts.{parameter}: {value} {error}');
    }
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

  async getDetails (channelId, timestamp) {
    channelId = Number(channelId) || channelId;
    timestamp = Number(timestamp) || timestamp;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.getDetails() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.getDetails() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getDetails() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(timestamp)
        .isNotNullOrUndefined(`TipHelper.getDetails() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`TipHelper.getDetails() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getDetails() parameter, timestamp: ${timestamp} is less than or equal to zero`);
    }

    try {
      const get = async (results = []) => {
        const response = await this.client.websocket.emit(
          Command.GROUP_EVENT_LIST,
          {
            body: {
              groupId: channelId,
              id: timestamp,
              contextType: ContextType.MESSAGE,
              offset: results.length,
              limit: 50
            }
          }
        );

        results.push(...response.body);

        return response.body.length < 50
          ? results
          : await get(results);
      };

      return (await get())
        .map((serverTipDetails) =>
          new TipDetail(this.client, serverTipDetails)
        );
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  async getSummary (channelId, timestamp) {
    channelId = Number(channelId) || channelId;
    timestamp = Number(timestamp) || timestamp;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.getSummary() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.getSummary() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getSummary() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(timestamp)
        .isNotNullOrUndefined(`TipHelper.getSummary() parameter, timestamp: ${timestamp} is null or undefined`)
        .isValidNumber(`TipHelper.getSummary() parameter, timestamp: ${timestamp} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getSummary() parameter, timestamp: ${timestamp} is less than or equal to zero`);
    }
    return (await this.getSummaries(channelId, [timestamp]))[0];
  }

  async getSummaries (channelId, timestamps) {
    channelId = Number(channelId) || channelId;
    timestamps = timestamps.map((timestamp) => Number(timestamp) || timestamp);

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.getSummaries() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.getSummaries() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getSummaries() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(timestamps)
        .isArray(`TipHelper.getSummaries() parameter, timestamps: ${timestamps} is not a valid array`)
        .each()
        .isNotNullOrUndefined('TipHelper.getSummaries() parameter, timestamp[{index}]: {value} is null or undefined')
        .isValidNumber('TipHelper.getSummaries() parameter, timestamp[{index}]: {value} is not a valid number')
        .isGreaterThan(0, 'TipHelper.getSummaries() parameter, timestamp[{index}]: {value} is less than or equal to zero');
    }

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
      .map(([, serverTipSummaryResponse]) =>
        serverTipSummaryResponse.success
          ? new TipSummary(this.client, serverTipSummaryResponse.body)
          : null
      );
  }

  async getChannelLeaderboard (channelId, tipPeriod, tipType, tipDirection) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.getChannelLeaderboard() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.getChannelLeaderboard() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getChannelLeaderboard() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(tipPeriod)
        .isNotNullOrUndefined(`TipHelper.getChannelLeaderboard() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getChannelLeaderboard() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipType)
        .isNotNullOrUndefined(`TipHelper.getChannelLeaderboard() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getChannelLeaderboard() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipDirection)
        .isNotRequired()
        .isNotNull(`TipHelper.getChannelLeaderboard() parameter, tipDirection: ${tipDirection} is null`)
        .isValidConstant(TipDirection, `TipHelper.getChannelLeaderboard() parameter, tipDirection: ${tipDirection} is not valid`);
    }
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
        return null;
      }
      throw error;
    }
  }

  async getChannelleaderboardSummary (channelId, tipPeriod, tipType, tipDirection) {
    channelId = Number(channelId) || channelId;

    { // eslint-disable-line no-lone-blocks
      validate(channelId)
        .isNotNullOrUndefined(`TipHelper.getChannelleaderboardSummary() parameter, channelId: ${channelId} is null or undefined`)
        .isValidNumber(`TipHelper.getChannelleaderboardSummary() parameter, channelId: ${channelId} is not a valid number`)
        .isGreaterThan(0, `TipHelper.getChannelleaderboardSummary() parameter, channelId: ${channelId} is less than or equal to zero`);

      validate(tipPeriod)
        .isNotNullOrUndefined(`TipHelper.getChannelleaderboardSummary() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getChannelleaderboardSummary() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipType)
        .isNotNullOrUndefined(`TipHelper.getChannelleaderboardSummary() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getChannelleaderboardSummary() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipDirection)
        .isNotRequired()
        .isNotNull(`TipHelper.getChannelleaderboardSummary() parameter, tipDirection: ${tipDirection} is null`)
        .isValidConstant(TipDirection, `TipHelper.getChannelleaderboardSummary() parameter, tipDirection: ${tipDirection} is not valid`);
    }
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
        return null;
      }
      throw error;
    }
  }

  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection) {
    { // eslint-disable-line no-lone-blocks
      validate(tipPeriod)
        .isNotNullOrUndefined(`TipHelper.getGlobalLeaderboard() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getGlobalLeaderboard() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipType)
        .isNotNullOrUndefined(`TipHelper.getGlobalLeaderboard() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getGlobalLeaderboard() parameter, tipPeriod: ${tipPeriod} is not valid`);

      validate(tipDirection)
        .isNotRequired()
        .isNotNull(`TipHelper.getGlobalLeaderboard() parameter, tipDirection: ${tipDirection} is null`)
        .isValidConstant(TipDirection, `TipHelper.getGlobalLeaderboard() parameter, tipDirection: ${tipDirection} is not valid`);
    }
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
        return null;
      }
      throw error;
    }
  }

  async getGlobalLeaderboardSummary (tipPeriod) {
    { // eslint-disable-line no-lone-blocks
      validate(tipPeriod)
        .isNotNullOrUndefined(`TipHelper.getGlobalLeaderboardSummary() parameter, tipPeriod: ${tipPeriod} is null or undefined`)
        .isValidConstant(TipPeriod, `TipHelper.getGlobalLeaderboardSummary() parameter, tipPeriod: ${tipPeriod} is not valid`);
    }
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
        return null;
      }
      throw error;
    }
  }
}

export default TipHelper;
