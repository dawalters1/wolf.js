import CacheManager from './cacheManager.ts';
import ChannelMember from '../structures/channelMember.ts';

interface ChannelMemberMetadata {
  [key: string]: boolean;
  privileged: boolean,
  regular: boolean,
  bots: boolean,
  banned: boolean,
  silenced: boolean
}

class ChannelMemberManager extends CacheManager<ChannelMember> {
  metadata: ChannelMemberMetadata;
  constructor () {
    super();

    this.metadata = {
      privileged: false,
      regular: false,
      bots: false,
      banned: false,
      silenced: false
    };
  }
}

export default ChannelMemberManager;
