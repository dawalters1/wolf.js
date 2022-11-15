import Capability from '../constants/Capability.js';
import Base from './Base.js';
import GroupAudioConfig from './GroupAudioConfig.js';
import GroupAudioCounts from './GroupAudioCounts.js';
import GroupExtended from './GroupExtended.js';
import GroupMemberList from './GroupMemberList.js';
import GroupMessageConfig from './GroupMessageConfig.js';
import IconInfo from './IconInfo.js';
import IdHash from './IdHash.js';

class Group extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.hash = data?.hash;
    this.name = data?.name;
    this.description = data?.description;
    this.reputation = data?.reputation;
    this.owner = new IdHash(data?.owner);
    this.membersCount = data?.memberCount;
    this.official = data?.official;
    this.peekable = data?.peekable;
    this.premium = data?.premium;
    this.icon = data?.icon;
    this.iconInfo = new IconInfo(client, data?.iconInfo, 'group', data?.id);
    this.extended = new GroupExtended(client, data?.extended);
    this.audioCounts = new GroupAudioCounts(client, data?.audioCounts);
    this.audioConfig = new GroupAudioConfig(client, data?.audioConfig);
    this.messageConfig = new GroupMessageConfig(client, data?.messageConfig);
    this.members = new GroupMemberList(client, data?.id);

    this.inGroup = false;
    this.capabilities = Capability.NOT_MEMBER;

    this.exists = data?.memberCount > 0;
  }

  getAvatarUrl (size) {
    return this.iconInfo.get(size);
  }

  async getAvatar (size) {
    return this.client.utility.group.getAvatar(this.id, size);
  }

  toJSON () {
    return {
      id: this.id,
      hash: this.hash,
      name: this.name,
      description: this.description,
      reputation: this.reputation,
      owner: this.owner.toJSON(),
      membersCount: this.membersCount,
      official: this.official,
      peekable: this.peekable,
      premium: this.premium,
      icon: this.icon,
      iconInfo: this.iconInfo.toJSON(),
      extended: this.extended.toJSON(),
      audioCounts: this.audioCounts.toJSON(),
      audioConfig: this.audioConfig.toJSON(),
      messageConfig: this.messageConfig.toJSON(),
      inGroup: this.inGroup,
      capabilities: this.capabilities,
      exists: this.exists
    };
  }
}

export default Group;
