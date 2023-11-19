import Base from '../Base.js';
import validator from '../../validator/index.js';
import models from '../../models/index.js';
import { Command } from '../../constants/index.js';

class Subscriber extends Base {
  async channels (subscriberId) {
    { // eslint-disable-line no-lone-blocks
      if (validator.isNullOrUndefined(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be null or undefined', { subscriberId });
      } else if (!validator.isValidNumber(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId must be a valid number', { subscriberId });
      } else if (validator.isLessThanOrEqualZero(subscriberId)) {
        throw new models.WOLFAPIError('subscriberId cannot be less than or equal to 0', { subscriberId });
      }
    }

    const response = await this.client.websocket.emit(
      Command.SUBSCRIBER_ROLE_SUMMARY,
      {
        subscriberId: parseInt(subscriberId)
      }
    );

    return response?.body?.map((role) => new models.SubscriberRole(this.client, role)) ?? [];
  }
}

export default Subscriber;
