const Helper = require('../Helper');

const validator = require('@dawalters1/validator');

const request = require('../../constants/request');

const constants = require('@dawalters1/constants');

module.exports = class Tip extends Helper {
  // eslint-disable-next-line no-useless-constructor
  constructor (bot) {
    super(bot);
  }

  async _groupSubscribe () {
    return await this._websocket.emit(request.TIP_GROUP_SUBSCRIBE);
  }

  async _privateSubscribe () {
    return await this._websocket.emit(request.TIP_PRIVATE_SUBSCRIBE);
  }

  async tip (subscriberId, groupId, context, charms) {
    try {
    // #region
      if (!validator.isValidNumber(subscriberId)) {
        throw new Error('subscriberId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('subscriberId cannot be less than or equal to 0');
      }
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }

      if (validator.isNull(context)) {
        throw new Error('context cannot be null');
      } else {
        if (validator.isNullOrWhitespace(context.type)) {
          throw new Error('type cannot be null or empty');
        } else if (!Object.values(constants.contextType).includes(context.type)) {
          throw new Error('type is invalid');
        }

        if (context.type === constants.contextType.MESSAGE) {
          if (!validator.isNull(context.id)) {
            if (!validator.isValidNumber(context.id)) {
              throw new Error('id must be a valid number');
            } else if (validator.isLessThanOrEqualZero(context.id)) {
              throw new Error('id cannot be less than or equal to 0');
            }
          } else {
            throw new Error('id cannot be null or empty with type MESSAGE');
          }
        }
      }

      if (validator.isNullOrWhitespace(constants.contextType)) {
        throw new Error('contextType cannot be null or empty');
      } else if (!Object.values(constants.contextType).includes(context.type)) {
        throw new Error('contextType is not valid');
      }

      if (validator.isValidArray(charms)) {
        for (const charm of charms) {
          if (charm) {
            if (charm.quantity) {
              if (!validator.isValidNumber(charm.quantity)) {
                throw new Error('quantity must be a valid number');
              } else if (validator.isLessThanZero(charm.quantity)) {
                throw new Error('quantity must be larger than or equal to 0');
              }
            } else {
              throw new Error('charm must contain a quantity');
            }

            if (charm.id) {
              if (!validator.isValidNumber(charm.id)) {
                throw new Error('id must be a valid number');
              } else if (validator.isLessThanOrEqualZero(charm.id)) {
                throw new Error('id cannot be less than or equal to 0');
              }
            } else {
              throw new Error('charm must contain a id');
            }
          } else {
            throw new Error('charm cannot be null or empty');
          }
        }
      } else {
        if (charms) {
          if (charms.quantity) {
            if (!validator.isValidNumber(charms.quantity)) {
              throw new Error('quantity must be a valid number');
            } else if (validator.isLessThanZero(charms.quantity)) {
              throw new Error('quantity must be larger than or equal to 0');
            }
          } else {
            throw new Error('charm must contain a quantity');
          }

          if (charms.id) {
            if (!validator.isValidNumber(charms.id)) {
              throw new Error('id must be a valid number');
            } else if (validator.isLessThanOrEqualZero(charms.id)) {
              throw new Error('id cannot be less than or equal to 0');
            }
          } else {
            throw new Error('charm must contain a id');
          }
        } else {
          throw new Error('charm cannot be null or empty');
        }
      }
      // #endregion

      return await this._websocket.emit(request.TIP_ADD, {
        subscriberId,
        groupId,
        charmList: validator.isValidArray(charms) ? charms : [charms],
        context
      });
    } catch (error) {
      error.method = `Helper/Tip/tip(subscriberId = ${JSON.stringify(subscriberId)}, groupId = ${JSON.stringify(groupId)}, context = ${JSON.stringify(context)}, charms =  ${JSON.stringify(charms)})`;
      throw error;
    }
  }

  async getDetails (groupId, timestamp, limit = 20, offset = 0) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(request.TIP_DETAIL, {
        groupId,
        id: timestamp,
        contextType: constants.contextType.MESSAGE,
        limit,
        offset
      });
    } catch (error) {
      error.method = `Helper/Tip/getDetails(groupId = ${JSON.stringify(groupId)}, timestamp = ${JSON.stringify(timestamp)}, limit = ${JSON.stringify(limit)}, offset = ${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getSummary (groupId, timestamp, limit = 20, offset = 0) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
      }
      if (!validator.isValidNumber(timestamp)) {
        throw new Error('timestamp must be a valid number');
      } else if (validator.isLessThanOrEqualZero(timestamp)) {
        throw new Error('timestamp cannot be less than or equal to 0');
      }

      if (!validator.isValidNumber(limit)) {
        throw new Error('limit must be a valid number');
      } else if (validator.isLessThanOrEqualZero(limit)) {
        throw new Error('limit cannot be less than or equal to 0');
      }
      if (!validator.isValidNumber(offset)) {
        throw new Error('offset must be a valid number');
      } else if (validator.isLessThanZero(offset)) {
        throw new Error('offset cannot be less than 0');
      }

      return await this._websocket.emit(request.TIP_SUMMARY, {
        groupId,
        id: timestamp,
        contextType: constants.contextType.MESSAGE,
        limit,
        offset
      });
    } catch (error) {
      error.method = `Helper/Tip/getSummary(groupId = ${JSON.stringify(groupId)}, timestamp = ${JSON.stringify(timestamp)}, limit = ${JSON.stringify(limit)}, offset = ${JSON.stringify(offset)})`;
      throw error;
    }
  }

  async getGroupLeaderboard (groupId, tipPeriod, tipType, tipDirection) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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

      return await this._websocket.emit(request.TIP_LEADERBOARD_GROUP, {
        groupId,
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === constants.tipType.CHARM ? undefined : tipDirection
      });
    } catch (error) {
      error.method = `Helper/Tip/getGroupLeaderboard(groupId = ${JSON.stringify(groupId)}, tipPeriod = ${JSON.stringify(tipPeriod)}, tipType = ${JSON.stringify(tipType)}, tipDirection = ${JSON.stringify(tipDirection)})`;
      throw error;
    }
  }

  async getGroupLeaderboardSummary (groupId, tipPeriod, tipType, tipDirection) {
    try {
      if (!validator.isValidNumber(groupId)) {
        throw new Error('groupId must be a valid number');
      } else if (validator.isLessThanOrEqualZero(groupId)) {
        throw new Error('groupId cannot be less than or equal to 0');
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

      return await this._websocket.emit(request.TIP_LEADERBOARD_GROUP_SUMMARY, {
        id: groupId,
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === constants.tipType.CHARM ? null : tipDirection
      });
    } catch (error) {
      error.method = `Helper/Tip/getGroupLeaderboardSummary(groupId = ${JSON.stringify(groupId)}, tipPeriod = ${JSON.stringify(tipPeriod)}, tipType = ${JSON.stringify(tipType)}, tipDirection = ${JSON.stringify(tipDirection)})`;
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

      return await this._websocket.emit(request.TIP_LEADERBOARD_GLOBAL, {
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === constants.tipType.GROUP ? undefined : tipDirection
      });
    } catch (error) {
      error.method = `Helper/Tip/getGlobalLeaderboard(tipPeriod = ${JSON.stringify(tipPeriod)}, tipType = ${JSON.stringify(tipType)}, tipDirection = ${JSON.stringify(tipDirection)})`;
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

      return await this._websocket.emit(request.TIP_LEADERBOARD_GLOBAL_SUMMARY, {
        period: tipPeriod
      });
    } catch (error) {
      error.method = `Helper/Tip/getGlobalLeaderboardSummary(tipPeriod = ${JSON.stringify(tipPeriod)})`;
      throw error;
    }
  }
};
