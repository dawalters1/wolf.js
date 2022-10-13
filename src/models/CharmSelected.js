import Base from './Base.js';
import models from './index.js';
import validator from '../validator/index.js';

class CharmSelected extends Base {
  constructor (client, data) {
    super(client);
    this.charmId = data?.charmId;
    this.position = data?.position;
  }

  validate () {
    if (validator.isNullOrUndefined(this.position)) {
      throw new models.WOLFAPIError('position cannot be null or undefined', { charm: this.toJSON() });
    } else if (!validator.isValidNumber(this.position)) {
      throw new models.WOLFAPIError('position must be a valid number', { charm: this.toJSON() });
    } else if (validator.isLessThanZero(this.position)) {
      throw new models.WOLFAPIError('position cannot be less than 0', { charm: this.toJSON() });
    }

    if (validator.isNullOrUndefined(this.charmId)) {
      throw new models.WOLFAPIError('charmId cannot be null or undefined', { charm: this.toJSON() });
    } else if (!validator.isValidNumber(this.charmId)) {
      throw new models.WOLFAPIError('charmId must be a valid number', { charm: this.toJSON() });
    } else if (validator.isLessThanOrEqualZero(this.charmId)) {
      throw new models.WOLFAPIError('charmId cannot be less than or equal to 0', { charm: this.toJSON() });
    }
  }

  toJSON () {
    return {
      charmId: this.charmId,
      position: this.position
    };
  }
}

export default CharmSelected;
