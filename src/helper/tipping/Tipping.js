const BaseHelper = require('../BaseHelper');

const { request } = require('../../constants');
const validator = require('../../validator');
const constants = require('@dawalters1/constants');

class Tipping extends BaseHelper {
  async _groupSubscribe () {
    return await this._websocket.emit(request.TIP_GROUP_SUBSCRIBE);
  }

  async _privateSubscribe () {
    return await this._websocket.emit(request.TIP_PRIVATE_SUBSCRIBE);
  }

  async tip (targetSubscriberId, targetGroupId, context, charms) {
    try {
      charms = Array.isArray(charms) ? charms : [charms];

      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be null or undefined');
      } else if (validator.isValidNumber(targetSubscriberId)) {
        throw new Error('targetSubscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
        throw new Error('targetSubscriberId cannot be less than or equal to 0');
      }

      if (validator.isNullOrUndefined(context)) {
        throw new Error('context cannot be null or undefined');
      } else if (!Reflect.has(context, 'type')) {
        throw new Error('context must have property type');
      } else if (validator.isNullOrWhitespace(context.type)) {
        throw new Error('type cannot be null or empty');
      } else if (!Object.values(constants.contextType).includes(context.type)) {
        throw new Error('type is not valid');
      }

      if (context.type === constants.contextType.MESSAGE) {
        if (!Reflect.has(context, 'id')) {
          throw new Error('context must have property id');
        } else if (validator.isNullOrUndefined(context.id)) {
          throw new Error('id cannot be null or undefined');
        } else if (validator.isValidNumber(context.id)) {
          throw new Error('id must be a valid number');
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
        } else if (validator.isNullOrUndefined(targetSubscriberId)) {
          throw new Error('targetSubscriberId cannot be null or undefined');
        } else if (validator.isValidNumber(targetSubscriberId)) {
          throw new Error('targetSubscriberId must be a valid number');
        } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
          throw new Error('targetSubscriberId cannot be less than or equal to 0');
        }

        if (!Reflect.has(charm, 'id')) {
          throw new Error('charm must have property id');
        } else if (!validator.isValidNumber(charm.id)) {
          throw new Error('id must be a valid number');
        } else if (validator.isLessThanOrEqualZero(charm.id)) {
          throw new Error('id cannot be less than or equal to 0');
        }
      }

      return await this._websocket.emit(
        request.TIP_ADD,
        {
          subscriberId: targetSubscriberId,
          groupId: targetGroupId,
          charmList: charms,
          context
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().tip(targetSubscriberId=${JSON.stringify(targetSubscriberId)}, targetGroupId=${JSON.stringify(targetGroupId)}, context=${JSON.stringify(context)}, charms=${JSON.stringify(charms)})`;
      throw error;
    }
  }

  async getDetails (targetGroupId, timestamp, limit = 20, offset = 0) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('targetSubscriberId cannot be less than 0');
      }

      return await this._websocket.emit(
        request.TIP_DETAIL,
        {
          groupId: targetGroupId,
          id: timestamp,
          contextType: constants.contextType.MESSAGE,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getDetails(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`; throw error;
    }
  }

  async getSummary (targetGroupId, timestamp, limit = 20, offset = 0) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(timestamp)) {
        throw new Error('timestamp cannot be null or undefined');
      } else if (validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(limit)) {
        throw new Error('limit cannot be null or undefined');
      } else if (validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (validator.isNullOrUndefined(offset)) {
        throw new Error('offset cannot be null or undefined');
      } else if (validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('targetSubscriberId cannot be less than 0');
      }

      return await this._websocket.emit(
        request.TIP_SUMMARY,
        {
          groupId: targetGroupId,
          id: timestamp,
          contextType: constants.contextType.MESSAGE,
          limit,
          offset
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getSummary(targetGroupId=${JSON.stringify(targetGroupId)}, timestamp=${JSON.stringify(timestamp)}, limit=${JSON.stringify(limit)}, offset=${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getGroupLeaderboard (targetGroupId, tipPeriod, tipType, tipDirection) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }

      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(constants.tipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }

      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(constants.tipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }

      if (tipType !== constants.tipType.CHARM) {
        if (validator.isNullOrWhitespace(tipDirection)) {
          throw new Error('tipDirection cannot be null or empty');
        } else if (!Object.values(constants.tipDirection).includes(tipDirection)) {
          throw new Error('tipDirection is not valid');
        }
      }

      return await this._websocket.emit(
        request.TIP_LEADERBOARD_GROUP,
        {
          groupId: targetGroupId,
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === constants.tipType.CHARM ? undefined : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getGroupLeaderboard(targetGroupId=${JSON.stringify(targetGroupId)}, tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGroupLeaderboardSummary (targetGroupId, tipPeriod, tipType, tipDirection) {
    try {
      if (validator.isNullOrUndefined(targetGroupId)) {
        throw new Error('targetGroupId cannot be null or undefined');
      } else if (validator.isValidNumber(targetGroupId)) {
        throw new Error('targetGroupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
        throw new Error('targetGroupId cannot be less than or equal to 0');
      }
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(constants.tipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }
      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(constants.tipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }
      if (tipType !== constants.tipType.CHARM) {
        if (validator.isNullOrWhitespace(tipDirection)) {
          throw new Error('tipDirection cannot be null or empty');
        } else if (!Object.values(constants.tipDirection).includes(tipDirection)) {
          throw new Error('tipDirection is not valid');
        }
      }

      return await this._websocket.emit(
        request.TIP_LEADERBOARD_GROUP_SUMMARY,
        {
          id: targetGroupId,
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === constants.tipType.CHARM ? null : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getGroupLeaderboardSummary(targetGroupId=${JSON.stringify(targetGroupId)}, tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection = undefined) {
    try {
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(constants.tipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }
      if (validator.isNullOrWhitespace(tipType)) {
        throw new Error('tipType cannot be null or empty');
      } else if (!Object.values(constants.tipType).includes(tipType)) {
        throw new Error('tipType is not valid');
      }
      if (tipType === constants.tipType.CHARM) {
        throw new Error('tipType is not valid');
      }

      return await this._websocket.emit(
        request.TIP_LEADERBOARD_GLOBAL,
        {
          period: tipPeriod,
          type: tipType,
          tipDirection: tipType === constants.tipType.GROUP ? undefined : tipDirection
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getGlobalLeaderboard(tipPeriod=${JSON.stringify(tipPeriod)}, tipType=${JSON.stringify(tipType)}, tipDirection=${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGlobalLeaderboardSummary (tipPeriod) {
    try {
      if (validator.isNullOrWhitespace(tipPeriod)) {
        throw new Error('tipPeriod cannot be null or empty');
      } else if (!Object.values(constants.tipPeriod).includes(tipPeriod)) {
        throw new Error('tipPeriod is not valid');
      }

      return await this._websocket.emit(
        request.TIP_LEADERBOARD_GLOBAL_SUMMARY,
        {
          period: tipPeriod
        }
      );
    } catch (error) {
      error.internalErrorMessage = `api.tipping().getGlobalLeaderboardSummary(tipPeriod=${JSON.stringify(tipPeriod)})`;
      throw error;
    }
  }
}

module.exports = Tipping;
