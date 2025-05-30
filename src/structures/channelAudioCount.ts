import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerChannelAudioCount {
  broadcasterCount: number;
  consumerCount: number;
  id: number;
}

export class ChannelAudioCount extends BaseEntity {
  broadcasterCount: number;
  consumerCount: number;
  id: number;

  constructor (client: WOLF, data: ServerChannelAudioCount) {
    super(client);

    this.broadcasterCount = data.broadcasterCount;
    this.consumerCount = data.consumerCount;
    this.id = data.id;
  }
}

export default ChannelAudioCount;
