import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerIconInfo {
  availableSizes: Map<string, string>
  availableTypes: string[];
}

export class IconInfo extends BaseEntity {
  availableSizes: Map<string, string>;
  availableTypes: Set<string>;

  constructor (client: WOLF, data: ServerIconInfo) {
    super(client);

    this.availableSizes = data.availableSizes;
    this.availableTypes = new Set(data.availableTypes);
  }

  patch (entity: ServerIconInfo): this {
    this.availableSizes = entity.availableSizes;
    this.availableTypes = new Set(entity.availableTypes);

    return this;
  }
}
export default IconInfo;
