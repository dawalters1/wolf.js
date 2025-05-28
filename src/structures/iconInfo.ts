import WOLF from '../client/WOLF.ts';
import Base from './base.ts';

export interface ServerIconInfo {
    availableSizes: Map<string, string>
    availableTypes: string[];
}

export class IconInfo extends Base {
  availableSizes: Map<string, string>;
  availableTypes: Set<string>;

  constructor (client: WOLF, data: ServerIconInfo) {
    super(client);

    this.availableSizes = data.availableSizes;
    this.availableTypes = new Set(data.availableTypes);
  }
}

export default IconInfo;
