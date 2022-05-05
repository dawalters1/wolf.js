const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const { Command, TipPeriod, TipType, TipDirection, ContextType } = require('../../constants');

const models = require('../../models');

class Tipping extends Base {
  async _subscribeToGroup () {
    return await this.client.websocket.emit(Command.TIP_GROUP_SUBSCRIBE);
  }

  async _subscribeToPrivate () {
    return await this.client.websocket.emit(Command.TIP_PRIVATE_SUBSCRIBE);
  }

  async tip (targetSubscriberId, targetGroupId, context, charms) {
    charms = Array.isArray(charms) ? charms : [charms];

    if (validator.isNullOrUndefined(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be null or undefined', targetSubscriberId);
    } else if (!validator.isValidNumber(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId must be a valid number', targetSubscriberId);
    } else if (validator.isLessThanOrEqualZero(targetSubscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be less than or equal to 0', targetSubscriberId);
    }
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(context)) {
      throw new WOLFAPIError('context cannot be null or undefined', context);
    } else if (!Reflect.has(context, 'type')) {
      throw new WOLFAPIError('context must have property type', context);
    } else if (validator.isNullOrWhitespace(context.type)) {
      throw new WOLFAPIError('type cannot be null or empty', context);
    } else if (!Object.values(ContextType).includes(context.type)) {
      throw new WOLFAPIError('type is not valid', context);
    }

    if (context.type === ContextType.MESSAGE) {
      if (!Reflect.has(context, 'id')) {
        throw new WOLFAPIError('context must have property id', context.id);
      } else if (validator.isNullOrUndefined(context.id)) {
        throw new WOLFAPIError('id cannot be null or undefined', context.id);
      } else if (!validator.isValidNumber(context.id)) {
        throw new WOLFAPIError('id must be a valid number', context.id);
      } else if (validator.isLessThanOrEqualZero(context.id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', context.id);
      }
      context.id = parseInt(context.id);
    }

    for (const charm of charms) {
      if (validator.isNullOrUndefined(charm)) {
        throw new WOLFAPIError('charm cannot be null or undefined', charm);
      }

      if (!Reflect.has(charm, 'quantity')) {
        throw new WOLFAPIError('charm must have quantity', charm);
      } else if (validator.isNullOrUndefined(charm.quantity)) {
        throw new WOLFAPIError('quantity cannot be null or undefined', charm);
      } else if (!validator.isValidNumber(charm.quantity)) {
        throw new WOLFAPIError('quantity must be a valid number', charm);
      } else if (validator.isLessThanOrEqualZero(charm.quantity)) {
        throw new WOLFAPIError('quantity cannot be less than or equal to 0', charm);
      }

      if (!Reflect.has(charm, 'id')) {
        throw new WOLFAPIError('charm must have property id', charm);
      } else if (!validator.isValidNumber(charm.id)) {
        throw new WOLFAPIError('id must be a valid number', charm);
      } else if (validator.isLessThanOrEqualZero(charm.id)) {
        throw new WOLFAPIError('id cannot be less than or equal to 0', charm);
      }
    }

    return await this.client.websocket.emit(
      Command.TIP_ADD,
      {
        subscriberId: parseInt(targetSubscriberId),
        groupId: parseInt(targetGroupId),
        charmList: charms,
        context
      }
    );
  }

  async getDetails (targetGroupId, timestamp, limit = 20, offset = 0) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(limit)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new WOLFAPIError('offset cannot be null or undefined', offset);
    } else if (!validator.isValidNumber(offset)) {
      throw new WOLFAPIError('offset must be a valid number', offset);
    } else if (validator.isLessThanZero(offset)) {
      throw new WOLFAPIError('offset cannot be less than 0', offset);
    }

    const response = await this.client.websocket.emit(
      Command.TIP_DETAIL,
      {
        groupId: parseInt(targetGroupId),
        id: parseInt(timestamp),
        contextType: ContextType.MESSAGE,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    );

    return response.success ? new models.TipDetail(this.client, response.body) : undefined;
  }

  async getSummary (targetGroupId, timestamp, limit = 20, offset = 0) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrUndefined(limit)) {
      throw new WOLFAPIError('limit cannot be null or undefined', limit);
    } else if (!validator.isValidNumber(limit)) {
      throw new WOLFAPIError('limit must be a valid number', limit);
    } else if (validator.isLessThanOrEqualZero(limit)) {
      throw new WOLFAPIError('limit cannot be less than or equal to 0', limit);
    }

    if (validator.isNullOrUndefined(offset)) {
      throw new WOLFAPIError('offset cannot be null or undefined', offset);
    } else if (!validator.isValidNumber(offset)) {
      throw new WOLFAPIError('offset must be a valid number', offset);
    } else if (validator.isLessThanZero(offset)) {
      throw new WOLFAPIError('offset cannot be less than 0', offset);
    }

    const response = await this.client.websocket.emit(
      Command.TIP_SUMMARY,
      {
        groupId: parseInt(targetGroupId),
        id: parseInt(timestamp),
        contextType: ContextType.MESSAGE,
        limit,
        offset
      }
    );

    return response.success ? new models.TipSummary(this.client, response.body) : undefined;
  }

  async getGroupLeaderboard (targetGroupId, tipPeriod, tipType, tipDirection) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }

    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod cannot be null or empty', tipPeriod);
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod is not valid', tipPeriod);
    }

    if (validator.isNullOrWhitespace(tipType)) {
      throw new WOLFAPIError('tipType cannot be null or empty', tipType);
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new WOLFAPIError('tipType is not valid', tipType);
    }

    if (tipType !== TipType.CHARM) {
      if (validator.isNullOrWhitespace(tipDirection)) {
        throw new WOLFAPIError('tipDirection cannot be null or empty', tipDirection);
      } else if (!Object.values(TipDirection).includes(tipDirection)) {
        throw new WOLFAPIError('tipDirection is not valid', tipDirection);
      }
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GROUP,
      {
        groupId: parseInt(targetGroupId),
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === TipType.CHARM ? undefined : tipDirection
      }
    );

    return response.success ? new models.TipLeaderboard(this.client, response.body) : undefined;
  }

  async getGroupLeaderboardSummary (targetGroupId, tipPeriod, tipType, tipDirection) {
    if (validator.isNullOrUndefined(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be null or undefined', targetGroupId);
    } else if (!validator.isValidNumber(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId must be a valid number', targetGroupId);
    } else if (validator.isLessThanOrEqualZero(targetGroupId)) {
      throw new WOLFAPIError('targetGroupId cannot be less than or equal to 0', targetGroupId);
    }
    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod cannot be null or empty', tipPeriod);
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod is not valid', tipPeriod);
    }
    if (validator.isNullOrWhitespace(tipType)) {
      throw new WOLFAPIError('tipType cannot be null or empty', tipType);
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new WOLFAPIError('tipType is not valid', tipType);
    }
    if (tipType !== TipType.CHARM) {
      if (validator.isNullOrWhitespace(tipDirection)) {
        throw new WOLFAPIError('tipDirection cannot be null or empty', tipDirection);
      } else if (!Object.values(TipDirection).includes(tipDirection)) {
        throw new WOLFAPIError('tipDirection is not valid', tipDirection);
      }
    }

    const response = await this.client.websocket.emit(
      Command.TIP_LEADERBOARD_GROUP_SUMMARY,
      {
        id: parseInt(targetGroupId),
        period: tipPeriod,
        type: tipType,
        tipDirection: tipType === TipType.CHARM ? null : tipDirection
      }
    );

    return response.success ? new models.TipLeaderboardSummary(this.client, response.body) : undefined;
  }

  async getGlobalLeaderboard (tipPeriod, tipType, tipDirection = undefined) {
    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod cannot be null or empty', tipPeriod);
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod is not valid', tipPeriod);
    }
    if (validator.isNullOrWhitespace(tipType)) {
      throw new WOLFAPIError('tipType cannot be null or empty', tipType);
    } else if (!Object.values(TipType).includes(tipType)) {
      throw new WOLFAPIError('tipType is not valid', tipType);
    }
    if (tipType === TipType.CHARM) {
      throw new WOLFAPIError('tipType is not valid', tipType);
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

  async getGlobalLeaderboardSummary (tipPeriod) {
    if (validator.isNullOrWhitespace(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod cannot be null or empty', tipPeriod);
    } else if (!Object.values(TipPeriod).includes(tipPeriod)) {
      throw new WOLFAPIError('tipPeriod is not valid', tipPeriod);
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

module.exports = Tipping;
