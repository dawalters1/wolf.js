import BaseEntity from './baseEntity';
import IdHash, { ServerIdHash } from './idHash';
import WOLF from '../client/WOLF';

export type ServerTipCharm = {
  id: number,
  quanitity: number
  charmId: number;
  credits: number;
  magnitude: number;
  subscriber: ServerIdHash;
}

export class TipCharm extends BaseEntity {
  id: number;
  quanitity: number;
  charmId: number;
  credits: number;
  magnitude: number;
  user: IdHash;

  constructor (client: WOLF, data: ServerTipCharm) {
    super(client);

    this.id = data.id;
    this.quanitity = data.quanitity;
    this.charmId = data.charmId;
    this.credits = data.credits;
    this.magnitude = data.magnitude;
    this.user = new IdHash(this.client, data.subscriber);
  }
}

export default TipCharm;
