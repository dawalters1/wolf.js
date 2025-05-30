import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

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
}

export default ChannelAudioConfig;
