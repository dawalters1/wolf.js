const { Command } = require('../../constants');
const Base = require('../Base');

const validator = require('../../validator');
const WOLFAPIError = require('../../models/WOLFAPIError');
const models = require('../../models');

class Subscriber extends Base {
  async getById (subscriberId) {
    if (validator.isNullOrUndefined(subscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be null or undefined', { subscriberId });
    } else if (!validator.isValidNumber(subscriberId)) {
      throw new WOLFAPIError('targetSubscriberId must be a valid number', { subscriberId });
    } else if (validator.isLessThanOrEqualZero(subscriberId)) {
      throw new WOLFAPIError('targetSubscriberId cannot be less than or equal to 0', { subscriberId });
    }

    const response = await this.client.websocket.emit(
      Command.ACHIEVEMENT_SUBSCRIBER_LIST,
      {
        headers: {
          version: 2
        },
        body: {
          id: parseInt(subscriberId)
        }
      }
    );

    return response.success ? response.body.map((achivement) => models.AchievementUnlockable(this.client, achivement)) : [];
  }
}

module.exports = Subscriber;
