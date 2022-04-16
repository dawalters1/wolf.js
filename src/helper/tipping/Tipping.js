const BaseHelper = require('../BaseHelper');

const { Commands, ContextType, TipType, TipDirection, TipPeriod } = require('../../constants');
const validator = require('../../validator');

class Tipping extends BaseHelper {
  // eslint-disable-next-line no-useless-constructor
  constructor (api) {
    super(api);
  }

  async _groupSubscribe () {
    return await this._websocket.emit(Commands.TIP_GROUP_SUBSCRIBE);
  }

  async _privateSubscribe () {
    return await this._websocket.emit(Commands.TIP_PRIVATE_SUBSCRIBE);
  }

  async tip (targetSubscriberId, targetGroupId, context, charms) {
    try {
      charms = Array.isArray(charms) ? charms : [charms];

      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (!validator.isType(targetSubscriberId, 'number')) {
        throw new Error('targetSubscriberId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(context)) {
        throw new Error('context cannot be null or undefined');
      } else if (!Reflect.has(context, 'type')) {
        throw new Error('context must have property type');
      } else if (validator.isNullOrWhitespace(context.type)) {
        throw new Error('type cannot be null or empty');
      } else if (!Object.values(ContextType).includes(context.type)) {
        throw new Error('type is not valid');
      }

      if (context.type === ContextType.MESSAGE) {
        if (!Reflect.has(context, 'id')) {
          throw new Error('context must have property id');
        } else if (validator.isNullOrUndefined(context.id)) {
          throw new Error('id cannot be null or undefined');
        } else if (!validator.isValidNumber(context.id)) {
          throw new Error('id must be a valid number');
        } else if (!validator.isType(context.id, 'number')) {
          throw new Error('id must be type of number');
        } else if (validator.isLessThanOrEqualZero(context.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }
      }

      for (const charm of charms) {
        if (validator.isNullOrUndefined(charm)) {
          throw new Error('charm cannot be null or undefined');
        }

        if (!Reflect.has(charm, 'quantity')) {
          throw new Error('charm must have quantity');
        } else if (validator.isNullOrUndefined(charm.quantity)) {
          throw new Error('quantity cannot be null or undefined');
        } else if (!validator.isValidNumber(charm.quantity)) {
          throw new Error('quantity must be a valid number');
        } else if (!validator.isType(charm.quantity, 'number')) {
          throw new Error('quantity must be type of number');
        } else if (validator.isLessThanOrEqualZero(charm.quantity)) {
          throw new Error('quantity cannot be less than or equal to 0');
        }

        if (!Reflect.has(charm, 'id')) {
          throw new Error('charm must have property id');
        } else if (!validator.isValidNumber(charm.id)) {
          throw new Error('id must be a valid number');
        } else if (!validator.isType(charm.id, 'number')) {
          throw new Error('id must be type of number');
        } else if (validator.isLessThanOrEqualZero(charm.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }
      }

      return await this._websocket.emit(
        Commands.TIP_ADD,
        {
          subscriberId: targetSubscriberId,
          groupId: targetGroupId,
          charmList: charms,
          context
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.tip(targetSubscriberId=${JSON.stringify(targetSubscriberId)}, targetGroupId=${JSON.stringify(targetGroupId)}, context=${JSON.stringify(context)}, charms=${JSON.stringify(charms)})`;
      throw error;
    }
  }

  async getDetails (targetGroupId, timestamp, limit = 20, offset = 0) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (!validator.isType(limit, 'number')) {
        throw new Error('limit must be type of number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (!validator.isType(offset, 'number')) {
        throw new Error('offset must be type of number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(
        Commands.TIP_DETAIL,
        {
          groupId: targetGroupId,
          id: timestamp,
          contextType: ContextType.MESSAGE,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getDetails(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`; throw error;
    }
  }

  async getSummary (targetGroupId, timestamp, limit = 20, offset = 0) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (!validator.isType(limit, 'number')) {
        throw new Error('limit must be type of number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (!validator.isType(offset, 'number')) {
        throw new Error('offset must be type of number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(
        Commands.TIP_SUMMARY,
        {
          groupId: targetGroupId,
          id: timestamp,
          contextType: ContextType.MESSAGE,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getSummary(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getGroupLeaderboard (targetGroupId, tipPeriod, tipType, tipDirection) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }

      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(TipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }

      if (tipType !== TipType.CHARM) {
        if (validator.isNullOrWhitespace(tipDirection)) {
          throw new Error('tipDirection cannot be null or empty');
        } else if (!Object.values(TipDirection).includes(tipDirection)) {
          throw new Error('tipDirection is not valid');
        }
      }

      return await this._websocket.emit(
        Commands.TIP_LEADERBOARD_GROUP,
        {
          groupId: targetGroupId,
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === TipType.CHARM ? undefined : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getGroupLeaderboard(targetGroupId=${JSON.stringify(targetGroupId)}, tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGroupLeaderboardSummary (targetGroupId, tipPeriod, tipType, tipDirection) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (!validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (!validator.isType(targetGroupId, 'number')) {
        throw new Error('targetGroupId must be type of number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }
      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(TipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }
      if (tipType !== TipType.CHARM) {
        if (validator.isNullOrWhitespace(tipDirection)) {
          throw new Error('tipDirection cannot be null or empty');
        } else if (!Object.values(TipDirection).includes(tipDirection)) {
          throw new Error('tipDirection is not valid');
        }
      }

      return await this._websocket.emit(
        Commands.TIP_LEADERBOARD_GROUP_SUMMARY,
        {
          id: targetGroupId,
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === TipType.CHARM ? null : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getGroupLeaderboardSummary(targetGroupId=${JSON.stringify(targetGroupId)}, tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection = undefined) {
    try {
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }
      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(TipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }
      if (tipType === TipType.CHARM) {
        throw new Error('tipType is not valid');
      }

      return await this._websocket.emit(
        Commands.TIP_LEADERBOARD_GLOBAL,
        {
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === TipType.GROUP ? undefined : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getGlobalLeaderboard(tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGlobalLeaderboardSummary (tipPeriod) {
    try {
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }

      return await this._websocket.emit(
        Commands.TIP_LEADERBOARD_GLOBAL_SUMMARY,
        {
          period: tipPeriod
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping${this._api instanceof require('../../client/WOLFBot') ? '()' : ''}.getGlobalLeaderboardSummary(tipPeriod=${JSON.stringify(tipPeriod)})`;
      throw error;
    }
  }
}

module.exports = Tipping;
