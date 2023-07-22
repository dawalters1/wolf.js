import Base from '../Base.js';
import validator from '../../validator/index.js';
import { Command, TipPeriod, TipType, TipDirection, ContextType } from '../../constants/index.js';
import models from '../../models/index.js';

class Tipping extends Base {
  async _subscribeToChannel () {
    return await this.client.websocket.emit(Command.TIP_GROUP_SUBSCRIBE);
  }

  async _subscribeToGroup () {
    return await this._subscribeToChannel();
  }

  async _subscribeToPrivate () {
    return await this.client.websocket.emit(Command.TIP_PRIVATE_SUBSCRIBE);
  }

  /**
   * Tip a subscriber
   * @param {Number} targetSubscriberId
   * @param {Number} targetChannelId
   * @param {{type:ContextType | String,id:Number|undefined}} context
   * @param {{ id: Number, quantity: Number } | Array<{ id: Number, quantity: Number }>} charms
   * @returns {Promise<Response>}
   */
  async tip (targetSubscriberId, targetChannelId, context, charms) {
    charms = Array.isArray(charms) ? charms : [charms];

    if (validator.isNullOrUndefined(targetSubscriberId)) {
      throw new models.WOLFAPIError('targetSubscriberId cannot be null or undefined', { targetSubscriberId });
    } else if (!validator.isValidNumber(targetSubscriberId)) {
      throw new models.WOLFAPIError('targetSubscriberId must be a valid number', { targetSubscriberId });
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new models.WOLFAPIError('targetSubscriberId cannot be less than or equal to 0', { targetSubscriberId });
    }

    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(context)) {
      throw new models.WOLFAPIError('context cannot be null or undefined', { context });
    } else if (!Reflect.has(context, 'type')) {
      throw new models.WOLFAPIError('context must have property type', { context });
    } else if (validator.isNullOrWhitespace(context.type)) {
      throw new models.WOLFAPIError('type cannot be null or empty', { context });
    } else if (!Object.values(ContextType).includes(context.type)) {
      throw new models.WOLFAPIError('type is not valid', { context });
    }

    if (context.type === ContextType.MESSAGE) {
      if (!Reflect.has(context, 'id')) {
        throw new models.WOLFAPIError('context must have property id', { contextId: context.id });
      } else if (validator.isNullOrUndefined(context.id)) {
        throw new models.WOLFAPIError('id cannot be null or undefined', { contextId: context.id });
      } else if (!validator.isValidNumber(context.id)) {
        throw new models.WOLFAPIError('id must be a valid number', { contextId: context.id });
      } else if (validator.isLessThanOrEqualZero(context.id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { contextId: context.id });
      }
      context.id = parseInt(context.id);
    }

    for (const charm of charms) {
      if (validator.isNullOrUndefined(charm)) {
        throw new models.WOLFAPIError('charm cannot be null or undefined', { charm });
      }

      if (!Reflect.has(charm, 'quantity')) {
        throw new models.WOLFAPIError('charm must have quantity', { charm });
      } else if (validator.isNullOrUndefined(charm.quantity)) {
        throw new models.WOLFAPIError('quantity cannot be null or undefined', { charm });
      } else if (!validator.isValidNumber(charm.quantity)) {
        throw new models.WOLFAPIError('quantity must be a valid number', { charm });
      } else if (validator.isLessThanOrEqualZero(charm.quantity)) {
        throw new models.WOLFAPIError('quantity cannot be less than or equal to 0', { charm });
      }

      if (!Reflect.has(charm, 'id')) {
        throw new models.WOLFAPIError('charm must have property id', { charm });
      } else if (!validator.isValidNumber(charm.id)) {
        throw new models.WOLFAPIError('id must be a valid number', { charm });
      } else if (validator.isLessThanOrEqualZero(charm.id)) {
        throw new models.WOLFAPIError('id cannot be less than or equal to 0', { charm });
      }
    }

    return await this.client.websocket.emit(
      Command.TIP_ADD,
      {
        subscriberId: parseInt(targetSubscriberId),
        groupId: parseInt(targetChannelId),
        charmList: charms,
        context
      }
    );
  }

  /**
   * Get a messages tip details
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @param {Number} limit
   * @param {Number} offset
   * @returns {Promise<TipDetail>}
   */
  async getDetails (targetChannelId, timestamp, limit = 20, offset = 0) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    const response = await this.client.websocket.emit(
      Command.TIP_DETAIL,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(timestamp),
        contextType: ContextType.MESSAGE,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return response.success ? new models.TipDetail(this.client, response.body) : undefined;
  }

  /**
   * Get a messages tip summary
   * @param {Number} targetChannelId
   * @param {Number} timestamp
   * @param {Number} limit
   * @param {Number} offset
   * @returns {Promise<TipSummary>}
   */
  async getSummary (targetChannelId, timestamp, limit = 20, offset = 0) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new models.WOLFAPIError('limit cannot be null or undefined', { limit });
    } else if (!validator.isValidNumber(limit)) {
      throw new models.WOLFAPIError('limit must be a valid number', { limit });
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new models.WOLFAPIError('limit cannot be less than or equal to 0', { limit });
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new models.WOLFAPIError('offset cannot be null or undefined', { offset });
    } else if (!validator.isValidNumber(offset)) {
      throw new models.WOLFAPIError('offset must be a valid number', { offset });
    } else if (validator.isLessThanZero(offset)) {
      throw new models.WOLFAPIError('offset cannot be less than 0', { offset });
    }

    const response = await this.client.websocket.emit(
      Command.TIP_SUMMARY,
      {
        groupId: parseInt(targetChannelId),
        id: parseInt(timestamp),
        contextType: ContextType.MESSAGE,
        limit,
        offset
      }
    );

    return response.success ? new models.TipSummary(this.client, response.body) : undefined;
  }

  /**
   * Get a channels tipping leaderboard
   * @param {Number} targetChannelId
   * @param {TipPeriod} tipPeriod
   * @param {TipType} tipType
   * @param {TipDirection} tipDirection
   * @returns {Promise<TipLeaderboard>}
   */
  async getChannelLeaderboard (targetChannelId, tipPeriod, tipType, tipDirection) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod cannot be null or empty', { tipPeriod });
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod is not valid', { tipPeriod });
    }

    if (validator.isNullOrWhitespace(tipType)) {
      throw new models.WOLFAPIError('tipType cannot be null or empty', { tipType });
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new models.WOLFAPIError('tipType is not valid', { tipType });
    }

    if (tipType !== TipType.CHARM) {
      if (validator.isNullOrWhitespace(tipDirection)) {
        throw new models.WOLFAPIError('tipDirection cannot be null or empty', { tipDirection });
      } else if (!Object.values(TipDirection).includes(tipDirection)) {
        throw new models.WOLFAPIError('tipDirection is not valid', { tipDirection });
      }
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GROUP,
      {
        groupId: parseInt(targetChannelId),
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === TipType.CHARM ? undefined : tipDirection
      }
    );

    return response.success ? new models.TipLeaderboard(this.client, response.body) : undefined;
  }

  /**
   * Get a group tipping leaderboard
   * @param {Number} targetChannelId
   * @param {TipPeriod} tipPeriod
   * @param {TipType} tipType
   * @param {TipDirection} tipDirection
   * @returns {Promise<TipLeaderboard>}
   */
  async getGroupLeaderboard (targetChannelId, tipPeriod, tipType, tipDirection) {
    return await this.getChannelLeaderboard(targetChannelId, tipPeriod, tipType, tipDirection);
  }

  /**
   * Get a channels tipping leaderboard summary
   * @param {Number} targetChannelId
   * @param {TipPeriod} tipPeriod
   * @param {TipType} tipType
   * @param {TipDirection} tipDirection
   * @returns {Promise<TipLeaderboardSummary>}
   */
  async getChannelLeaderboardSummary (targetChannelId, tipPeriod, tipType, tipDirection) {
    if (validator.isNullOrUndefined(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be null or undefined', { targetChannelId });
    } else if (!validator.isValidNumber(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId must be a valid number', { targetChannelId });
    } else if (validator.isLessThanOrEqualZero(targetChannelId)) {
      throw new models.WOLFAPIError('targetChannelId cannot be less than or equal to 0', { targetChannelId });
    }

    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod cannot be null or empty', { tipPeriod });
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod is not valid', { tipPeriod });
    }

    if (validator.isNullOrWhitespace(tipType)) {
      throw new models.WOLFAPIError('tipType cannot be null or empty', { tipType });
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new models.WOLFAPIError('tipType is not valid', { tipType });
    }

    if (tipType !== TipType.CHARM) {
      if (validator.isNullOrWhitespace(tipDirection)) {
        throw new models.WOLFAPIError('tipDirection cannot be null or empty', { tipDirection });
      } else if (!Object.values(TipDirection).includes(tipDirection)) {
        throw new models.WOLFAPIError('tipDirection is not valid', { tipDirection });
      }
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GROUP_SUMMARY,
      {
        id: parseInt(targetChannelId),
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === TipType.CHARM ? null : tipDirection
      }
    );

    return response.success ? new models.TipLeaderboardSummary(this.client, response.body) : undefined;
  }

  /**
   * Get a groups tipping leaderboard summary
   * @param {Number} targetChannelId
   * @param {TipPeriod} tipPeriod
   * @param {TipType} tipType
   * @param {TipDirection} tipDirection
   * @returns {Promise<TipLeaderboardSummary>}
   */
  async getGroupLeaderboardSummary (targetChannelId, tipPeriod, tipType, tipDirection) {
    return this.getChannelLeaderboardSummary(targetChannelId, tipPeriod, tipType, tipDirection);
  }

  /**
   * Get the global tipping leaderboard
   * @param {TipPeriod} tipPeriod
   * @param {TipType} tipType
   * @param {TipDirection} tipDirection
   * @returns {Promise<TipLeaderboard>}
   */
  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection = undefined) {
    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod cannot be null or empty', { tipPeriod });
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod is not valid', { tipPeriod });
    }

    if (validator.isNullOrWhitespace(tipType)) {
      throw new models.WOLFAPIError('tipType cannot be null or empty', { tipType });
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new models.WOLFAPIError('tipType is not valid', { tipType });
    }

    if (tipType === TipType.CHARM) {
      throw new models.WOLFAPIError('tipType is not valid', { tipType });
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GLOBAL,
      {
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === TipType.GROUP ? undefined : tipDirection
      }
    );

    return response.success ? new models.TipLeaderboard(this.client, response.body) : undefined;
  }

  /**
   * Get the global tipping leaderboard summary
   * @param {TipPeriod} tipPeriod
   * @returns {Promise<TipLeaderboardSummary>}
   */
  async getGlobalLeaderboardSummary (tipPeriod) {
    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod cannot be null or empty', { tipPeriod });
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new models.WOLFAPIError('tipPeriod is not valid', { tipPeriod });
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GLOBAL_SUMMARY,
      {
        period: tipPeriod
      }
    );

    return response.success ? new models.TipLeaderboardSummary(this.client, response.body) : undefined;
  }
}

export default Tipping;
