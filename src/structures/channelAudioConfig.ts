import BaseEntity from './baseEntity.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerGroupAudioConfig {
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

  constructor (client: WOLF, data: ServerGroupAudioConfig) {
    super(client);

    this.id = data.id;
    this.enabled = data.enabled;
    this.stageId = data.stageId;
    this.minRepLevel = data.minRepLevel;
  }

  patch (entity: ServerGroupAudioConfig): this {
    this.id = entity.id;
    this.enabled = entity.enabled;
    this.stageId = entity.stageId;
    this.minRepLevel = entity.minRepLevel;
    return this;
  }
}
export default ChannelAudioConfig;
