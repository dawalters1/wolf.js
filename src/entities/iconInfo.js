import BaseEntity from './baseEntity.js';

export class IconInfo extends BaseEntity {
  constructor (client, entity, targetType) {
    super(client);

    this.targetType = targetType;
    this.availableSizes = entity.availableSizes;
    this.availableTypes = new Set(entity.availableTypes);
  }

  get (size) {
    const baseUrl = this.client.config.endpointConfig.avatarEndpoint;
    const avatar = this.availableSizes[size];
    if (avatar) {
      return `${baseUrl}${avatar}`;
    }

    const availableSizes = Object.keys(this.availableSizes);

    // Find the next available size after the requested one
    const nextUp = availableSizes.find((key, idx) =>
      idx > availableSizes.indexOf(size) && this[key]
    );
    if (nextUp) {
      return `${baseUrl}${this.availableSizes[nextUp]}`;
    }

    // Sort sizes in descending order by their original index to find a smaller size
    const sortedDesc = [...availableSizes].sort((a, b) =>
      availableSizes.indexOf(b) - availableSizes.indexOf(a)
    );

    const nextDown = sortedDesc.find((key, idx) =>
      idx > sortedDesc.indexOf(size) && this.availableSizes[key]
    );
    if (nextDown) {
      return `${baseUrl}${this.availableSizes[nextDown]}`;
    }

    // Fallback placeholder replacement
    return this.client.utility.string.replace(
      this.client.config.framework.avatar.placeholderUrl,
      {
        type: this.targetType === 'user'
          ? 'subscriber'
          : 'group',
        lastNumOfId: this.targetId.toString().slice(-1)
      }
    );
  }

  /** @internal */
  patch (entity) {
    this.availableSizes = entity.availableSizes;
    this.availableTypes = new Set(entity.availableTypes);

    return this;
  }
}
export default IconInfo;
