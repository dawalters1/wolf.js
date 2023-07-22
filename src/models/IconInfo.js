
import Base from './Base.js';
import IconInfoAvailableSize from './IconInfoAvailableSize.js';

class IconInfo extends Base {
  constructor (client, data, targetType, targetId) {
    super(client);

    this.availableSizes = new IconInfoAvailableSize(client, data?.availableSizes, targetType, targetId);
    this.availableTypes = data?.availableTypes ?? [];
  }

  /**
   * Get the url for the specified size if it exists, else the closest available
   * @param {IconSize} size
   * @returns {string}
   */
  get (size) {
    return this.availableSizes.get(size);
  }
}

export default IconInfo;
