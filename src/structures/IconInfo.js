import Base from './Base.js';

class IconInfo extends Base {
  constructor (client, data) {
    super(client);

    // Test to ensure this maps correctly
    this.availableSizes = data?.availableSizes
      ? new Map(Object.entries(this.availableSizes))
      : undefined;
  }
}

export default IconInfo;
