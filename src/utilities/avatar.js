import AvatarType from '../constants/AvatarType.js';
import IconSize from '../constants/IconSize.js';
import { validate } from '../validator/index.js';

class AvatarUtility {
  constructor (client) {
    this.client = client;
  }

  async get (targetId, size, type) {
    targetId = Number(targetId) || targetId;

    { // eslint-disable-line no-lone-blocks
      validate(targetId)
        .isGreaterThan(0, `AvatarUtility.get() parameter targetId: ${targetId}, must be larger than 0`);

      validate(size)
        .isNotNullOrUndefined(`AvatarUtility.get() parameter, size: ${size} is null or undefined`)
        .isValidConstant(IconSize, `AvatarUtility.get() parameter, size: ${size} is not valid`);

      validate(type)
        .isNotNullOrUndefined(`AvatarUtility.get() parameter, type: ${type} is null or undefined`)
        .isValidConstant(AvatarType, `AvatarUtility.get() parameter, type: ${type} is not valid`);
    }

    throw new Error('NOT IMPLEMENTED');
    // TODO:
  }
}
