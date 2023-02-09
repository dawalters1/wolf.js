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

  get (size) {
    if (this[size]) {
      return `${this.client._frameworkConfig.get('avatar.endpoint')}${this[size]}`;
    }

    const available = Object.keys(this.toJSON());

    const nextUp = available.find((key, index) => index > available.indexOf(size) && this[key]);

    if (nextUp) {
      return `${this.client._frameworkConfig.get('avatar.endpoint')}${this[nextUp]}`;
    }

    const sorted = available.sort((a, b) => available.indexOf(b) - available.indexOf(a));

    const nextDown = sorted.find((key, index) => index > sorted.indexOf(size) && this[key]);

    if (nextDown) {
      return `${this.client._frameworkConfig.get('avatar.endpoint')}${this[nextDown]}`;
    }

    return this.client.utility.string.replace(this.client._frameworkConfig.get('avatar.placeholder'),
      {
        type: this.targetType,
        lastNumOfId: this.targetId.toString().slice(-1)[0]
      }
    );
  }
}

export default IconInfoAvailableSize;
