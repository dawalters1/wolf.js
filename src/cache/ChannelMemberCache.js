import Cache from './Cache.js';

const DEFAULT_METADATA = Object.freeze({
  privileged: false,
  regular: false,
  bots: false,
  banned: false,
  silenced: false
});

export default class ChannelMemberCache extends Cache {
  constructor () {
    super();

    this.metadata = { ...DEFAULT_METADATA };
  }

  clear () {
    super.clear();
    this.fetched = false;
    this.metadata = { ...DEFAULT_METADATA };
  }
}
