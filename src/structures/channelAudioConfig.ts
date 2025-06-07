import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerChannelAudioConfig {
  id: number;
  enabled: boolean;
  stageId?: number;
  minRepLevel: number;
}

export class ChannelAudioConfig extends BaseEntity {
  id: number;
  enabled: boolean;
  stageId?: number;
  minRepLevel: number;

  constructor (client: WOLF, data: ServerChannelAudioConfig) {
    super(client);

    this.id = data.id;
    this.enabled = data.enabled;
    this.stageId = data.stageId;
    this.minRepLevel = data.minRepLevel;
  }

  patch (entity: any): this {
    return this;
  }
}
export default ChannelAudioConfig;
