import BaseHelper from '../BaseHelper.js';
import ContextType from '../../constants/ContextType.js';
import { StatusCodes } from 'http-status-codes';
import TipDetail from '../../entities/TipDetail.js';
import TipLeaderboard from '../../entities/TipLeaderboard.js';
import TipLeaderboardSummary from '../../entities/TipLeaderboardSummary.js';
import TipSubscriptionTargetType from '../../constants/TipSubscriptionTargetType.js';
import TipSummary from '../../entities/TipSummary.js';
import { validate } from '../../validation/Validation.js';

export default class TipHelper extends BaseHelper {
  async subscribe (tipSubscriptionTargetType) {
    return await this.client.websocket.emit(
      tipSubscriptionTargetType === TipSubscriptionTargetType.CHANNEL
        ? 'tip group subscribe'
        : 'tip private subscribe'
    );
  }

  async tip (channelId, userId, context, charms) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedChannelId, this, this.tip)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedUserId, this, this.tip)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(context, this, this.tip)
      .isNotNullOrUndefined()
      .forEachProperty(
        {
          type: validator => validator
            .isNotNullOrUndefined()
            .in(Object.values(ContextType)),

          id: validator => validator
            .notRequiredIfProperty('type', ContextType.STAGE)
            .requiredIfProperty('type', ContextType.MESSAGE)
            .isValidNumber()
        }
      );

    validate(charms)
      .isNotNullOrUndefined()
      .isArray()
      .each()
      .forEachProperty(
        {
          id: validator => validator
            .isNotNullOrUndefined()
            .isValidNumber()
            .isNumberGreaterThanZero(),
          quantity: validator => validator.isNotNullOrUndefined()
            .isValidNumber()
            .isNumberGreaterThanZero()
            .isValidNumber()
        }
      );

    return this.client.websocket.emit(
      'tip add',
      {
        body: {
          groupId: normalisedChannelId,
          subscriberId: normalisedUserId,
          charmList: charms,
          context
        }
      }
    );
  }

  async details (channelId, timestamp) {
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedTimestamp = this.normaliseNumber(timestamp);

    validate(normalisedChannelId, this, this.details)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedTimestamp, this, this.details)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    try {
      const batch = async (results = []) => {
        const response = await this.client.websocket.emit(
          'tip detail',
          {
            body: {
              groupId: normalisedChannelId,
              id: normalisedTimestamp,
              contextType: ContextType.MESSAGE,
              offset: results.length,
              limit: 50
            }
          }
        );

        results.push(response.body.map((serverTipDetail) => new TipDetail(this.client, serverTipDetail)));

        return response.body.length < 50
          ? results
          : await batch(results);
      };

      return await batch();
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; };
      return [];
    }
  }

  async summary (channelId, timestamps) {
    const isArrayResponse = Array.isArray(timestamps);
    const normalisedChannelId = this.normaliseNumber(channelId);
    const normalisedTimestamps = this.normaliseNumbers(timestamps);

    validate(normalisedChannelId, this, this.summary)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(normalisedTimestamps, this, this.summary)
      .each()
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    const response = await this.client.websocket.emit(
      'tip summary',
      {
        body: {
          groupId: normalisedChannelId,
          idList: normalisedTimestamps,
          contextType: ContextType.MESSAGE
        }
      }
    );

    const summaries = Object.values(response.body)
      .map((childResponse) => childResponse.success
        ? new TipSummary(this.client, childResponse.body)
        : null);

    return isArrayResponse
      ? summaries
      : summaries[0];
  }

  async channelLeaderboard (channelId, tipPeriod, tipType, tipDirection) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    // TODO: validation
    try {
      const response = await this.client.websocket.emit(
        'tip leaderboard group',
        {
          body: {
            groupId: normalisedChannelId,
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

  async channelLeaderboardSummary (channelId, tipPeriod) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    // TODO: validation
    const response = await this.client.websocket.emit(
      'tip leaderboard global summary',
      {
        body: {
          id: normalisedChannelId,
          period: tipPeriod
        }
      }
    );

    return new TipLeaderboardSummary(this.client, response.body);
  }

  async globalLeaderboard (tipPeriod, tipType, tipDirection) {
    // TODO: validation
    const response = await this.client.websocket.emit(
      'tip leaderboard global',
      {
        body: {
          period: tipPeriod,
          type: tipType,
          tipDirection
        }
      }
    );

    return new TipLeaderboard(this.client, response.body);
  }

  async globalLeaderboardSummary (tipPeriod) {
    // TODO: validation

    const response = await this.client.websocket.emit(
      'tip leaderboard global summary',
      {
        body: {
          period: tipPeriod
        }
      }
    );

    return new TipLeaderboardSummary(this.client, response.body);
  }
}
