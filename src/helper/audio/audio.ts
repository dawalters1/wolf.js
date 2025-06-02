import AudioClient from '../../client/audio/audioClient';
import AudioSlotHelper from './audioSlot';
import AudioSlotRequestHelper from './audioSlotRequest';
import BaseHelper from '../baseHelper';
import WOLF from '../../client/WOLF';

class AudioHelper extends BaseHelper<AudioClient> {
  readonly slots: AudioSlotHelper;
  readonly slotRequest: AudioSlotRequestHelper;

  constructor (client: WOLF) {
    super(client);

    this.slots = new AudioSlotHelper(client);
    this.slotRequest = new AudioSlotRequestHelper(client);
  }
}

export default AudioHelper;
