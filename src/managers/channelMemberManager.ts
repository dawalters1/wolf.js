import ChannelMember from '../structures/channelMember.ts';
import CacheManager from './cacheManager.ts';

interface ChannelMemberMetadata {
    [key: string]: boolean;
    privileged: boolean,
    regular: boolean,
    bots: boolean,
    banned: boolean,
    silenced: boolean
}

class ChannelMemberManager extends CacheManager<ChannelMember, Map<number, ChannelMember>> {
  metadata: ChannelMemberMetadata;
  constructor () {
    super(new Map());

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
