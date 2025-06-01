import WOLF from '../client/WOLF.ts';

abstract class BaseEntity {
  client: WOLF;

  protected constructor (client: WOLF) {
    this.client = client;
  }

  patch?(entity: this): this
}

export default BaseEntity;
