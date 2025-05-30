import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

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
}

export default IconInfo;
