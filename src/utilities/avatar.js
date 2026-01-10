import AvatarType from '../constants/AvatarType.js';
import BaseUtility from './BaseUtility.js';
import IconSize from '../constants/IconSize.js';

export default class AvatarUtility extends BaseUtility {
  async get (targetId, size, type) {
    const normalisedTargetId = this.normaliseNumber(targetId);

    throw new Error('NOT IMPLEMENTED');
    // TODO:
  }
}
