import AvatarType from '../constants/AvatarType.js';
import axios from 'axios';
import BaseUtility from './BaseUtility.js';
import IconSize from '../constants/IconSize.js';

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

    // TODO: validation

    return await this.#download(AvatarType.CHANNEL, normalisedChannelId, size, type);
  }

  async user (userId, size, type) {
    const normalisedUserId = this.normaliseNumber(userId);

    // TODO: validation

    return await this.#download(AvatarType.USER, normalisedUserId, size, type);
  }
}
