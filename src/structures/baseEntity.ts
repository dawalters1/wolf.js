import _ from 'lodash';
import WOLF from '../client/WOLF.ts';

abstract class BaseEntity {
  client: WOLF;

  protected constructor (client: WOLF) {
    this.client = client;
  }

  patch?(entity: any): this

  clone (): this {
    return _.clone(this);
  }
}

export default BaseEntity;
