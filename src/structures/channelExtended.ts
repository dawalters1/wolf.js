import WOLF from '../client/WOLF.ts';
import { Language } from '../constants/Language.ts';
import Base from './base.ts';

export interface ServerChannelExtended {
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

export class ChannelExtended extends Base {
  id: number;
  discoverable: boolean;
  advancedAdmin: boolean;
  locked: boolean;
  questionable: boolean;
  entryLevel: number;
  passworded: boolean;
  language: Language;
  longDescription: string;

  constructor (client: WOLF, data: ServerChannelExtended) {
    super(client);

    this.id = data.id;
    this.discoverable = data.discoverable;
    this.advancedAdmin = data.advancedAdmin;
    this.locked = data.locked;
    this.questionable = data.questionable;
    this.entryLevel = data.entryLevel;
    this.passworded = data.passworded;
    this.language = data.language;
    this.longDescription = data.longDescription;
  }
}

export default ChannelExtended;
