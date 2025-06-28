import BaseEntity from './baseEntity.js';

export class IconInfo extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.availableSizes = entity.availableSizes;
    this.availableTypes = new Set(entity.availableTypes);
  }

  patch (entity) {
    this.availableSizes = entity.availableSizes;
    this.availableTypes = new Set(entity.availableTypes);

    return this;
  }
}
export default IconInfo;
