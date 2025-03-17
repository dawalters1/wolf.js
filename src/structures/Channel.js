import ChannelMemberManager from '../managers/ChannelMemberManager.js';
import Base from './Base.js';
import ChannelAudioConfig from './ChannelAudioConfig.js';
import ChannelAudioCount from './ChannelAudioCount.js';
import ChannelExtended from './ChannelExtended.js';
import ChannelMessageConfig from './ChannelMessageConfig.js';
import ChannelOwner from './ChannelOwner.js';
import IconInfo from './IconInfo.js';

class Channel extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.name = data?.name;
    this.hash = data?.hash;
    this.description = data?.description;
    this.reputation = data?.reputation;
    this.premium = data?.premium;
    this.icon = data?.icon; // Is this still used?
    this.iconHash = data?.iconHash;
    this.iconInfo = data?.iconInfo
      ? new IconInfo(client, data.iconInfo)
      : undefined;
    this.members = data?.members;
    this.official = data?.official;
    this.peekable = data?.peekable;
    this.owner = data?.owner
      ? new ChannelOwner(client, data.owner)
      : undefined;
    this.extended = data?.extended
      ? new ChannelExtended(client, data.extended)
      : undefined;
    this.audioConfig = data?.audioConfig
      ? new ChannelAudioConfig(client, data.audioConfig)
      : undefined;
    this.audioCount = data?.audioCount
      ? new ChannelAudioCount(client, data.audioCount)
      : undefined;
    this.messageConfig = data?.messageConfig
      ? new ChannelMessageConfig(client, data.messageConfig)
      : undefined;

    this.members = this.exists
      ? new ChannelMemberManager()
      : undefined;
  }

  get isOwner () {
    return this.owner.id === this.client.user.id;
  }
}

export default Channel;
