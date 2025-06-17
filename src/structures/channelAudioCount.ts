import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export type ServerGroupAudioCount = {
  broadcasterCount: number;
  consumerCount: number;
  id: number;
}

export class ChannelAudioCount extends BaseEntity {
  broadcasterCount: number;
  consumerCount: number;
  id: number;

  constructor (client: WOLF, data: ServerGroupAudioCount) {
    super(client);

    this.broadcasterCount = data.broadcasterCount;
    this.consumerCount = data.consumerCount;
    this.id = data.id;
  }

  patch (entity: ServerGroupAudioCount): this {
    this.broadcasterCount = entity.broadcasterCount;
    this.consumerCount = entity.consumerCount;
    this.id = entity.id;

    return this;
  }
}
export default ChannelAudioCount;
