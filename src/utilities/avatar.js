import AvatarType from '../constants/AvatarType.js';
import axios from 'axios';
import BaseUtility from './BaseUtility.js';
import IconSize from '../constants/IconSize.js';
import { validate } from '../validation/Validation.js';

export default class AvatarUtility extends BaseUtility {
  async #download (targetType, targetId, size, type) {
    const target = targetType === AvatarType.CHANNEL
      ? await this.client.channel.fetch(targetId)
      : await this.client.user.fetch(targetId);

    const avatarUrl = target.getAvatarUrl(size, type);

    try {
      const response = await axios({
        method: 'GET',
        url: avatarUrl,
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (err) {
      throw new Error(`Failed to download ${targetType} avatar: ${err.message}`);
    }
  }

  async channel (channelId, size, type) {
    const normalisedChannelId = this.normaliseNumber(channelId);

    validate(normalisedChannelId, this, this.channel)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(size)
      .isNotNullOrUndefined()
      .in(Object.values(IconSize));

    validate(type)
      .isNotNullOrUndefined()
      .in(Object.values(AvatarType));

    return await this.#download(AvatarType.CHANNEL, normalisedChannelId, size, type);
  }

  async user (userId, size, type) {
    const normalisedUserId = this.normaliseNumber(userId);

    validate(normalisedUserId, this, this.user)
      .isNotNullOrUndefined()
      .isValidNumber()
      .isNumberGreaterThanZero();

    validate(size)
      .isNotNullOrUndefined()
      .in(Object.values(IconSize));

    validate(type)
      .isNotNullOrUndefined()
      .in(Object.values(AvatarType));

    return await this.#download(AvatarType.USER, normalisedUserId, size, type);
  }
}
