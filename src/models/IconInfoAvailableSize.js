import Base from './Base.js';

class IconInfoAvailableSize extends Base {
  constructor (client, data, targetType, targetId) {
    super(client);

    this.targetType = targetType;
    this.targetId = targetId;

    this.small = data?.small;
    this.medium = data?.medium;
    this.large = data?.large;
    this.xlarge = data?.xlarge;
  }

  /**
   * Get the url for the specified size if it exists, else the closest available
   * @param {IconSize | String} size
   * @returns {String}
   */
  get (size) {
    if (this[size]) {
      return `${this.client.config.endpointConfig.avatarEndpoint}${this[size]}`;
    }

    const available = Object.keys(this.toJSON());

    const nextUp = available.find((key, index) => index > available.indexOf(size) && this[key]);

    if (nextUp) {
      return `${this.client.config.endpointConfig.avatarEndpoint}${this[nextUp]}`;
    }

    const sorted = available.sort((a, b) => available.indexOf(b) - available.indexOf(a));

    const nextDown = sorted.find((key, index) => index > sorted.indexOf(size) && this[key]);

    if (nextDown) {
      return `${this.client.config.endpointConfig.avatarEndpoint}${this[nextDown]}`;
    }

    return this.client.utility.string.replace(this.client._frameworkConfig.get('avatar.placeholder'),
      {
        type: this.targetType,
        lastNumOfId: this.targetId.toString().slice(-1)[0]
      }
    );
  }

  toJSON () {
    return {
      small: this.small,
      medium: this.medium,
      large: this.large,
      xlarge: this.xlarge
    };
  }
}

export default IconInfoAvailableSize;
