import BaseEntity from './baseEntity.ts';
import { Language } from '../constants/Language.ts';
import WOLF from '../client/WOLF.ts';

export interface ServerGroupExtended {
  id: number;
  discoverable: boolean;
  advancedAdmin: boolean;
  locked: boolean;
  questionable: boolean;
  entryLevel: number;
  passworded: boolean;
  language: Language;
  longDescription: string;
}

export class ChannelExtended extends BaseEntity {
  id: number;
  discoverable: boolean;
  advancedAdmin: boolean;
  locked: boolean;
  questionable: boolean;
  entryLevel: number;
  passworded: boolean;
  language: Language;
  longDescription: string | null;

  constructor (client: WOLF, data: ServerGroupExtended) {
    super(client);

    this.id = data.id;
    this.discoverable = data.discoverable;
    this.advancedAdmin = data.advancedAdmin;
    this.locked = data.locked;
    this.questionable = data.questionable;
    this.entryLevel = data.entryLevel;
    this.passworded = data.passworded;
    this.language = data.language;
    this.longDescription = data.longDescription || null;
  }

  patch (entity: ServerGroupExtended): this {
    this.id = entity.id;
    this.discoverable = entity.discoverable;
    this.advancedAdmin = entity.advancedAdmin;
    this.locked = entity.locked;
    this.questionable = entity.questionable;
    this.entryLevel = entity.entryLevel;
    this.passworded = entity.passworded;
    this.language = entity.language;
    this.longDescription = entity.longDescription || null;

    return this;
  }
}
export default ChannelExtended;
