import Capability from '../constants/Capability.js';
import Base from './Base.js';
import ChannelAudioConfig from './ChannelAudioConfig.js';
import ChannelAudioCounts from './ChannelAudioCounts.js';
import ChannelExtended from './ChannelExtended.js';
import ChannelMemberList from './ChannelMemberList.js';
import ChannelMessageConfig from './ChannelMessageConfig.js';
import IconInfo from './IconInfo.js';
import IdHash from './IdHash.js';

class Channel extends Base {
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
    this.iconHash = data?.iconHash;
    this.iconInfo = new IconInfo(client, data?.iconInfo, 'channel', data?.id);
    this.extended = new ChannelExtended(client, data?.extended);
    this.audioCounts = new ChannelAudioCounts(client, data?.audioCounts);
    this.audioConfig = new ChannelAudioConfig(client, data?.audioConfig);
    this.messageConfig = new ChannelMessageConfig(client, data?.messageConfig);
    this.members = new ChannelMemberList(client, data?.id);
    this.verificationTier = data?.verificationTier;

    this.inChannel = false;
    this.capabilities = Capability.NOT_MEMBER;

    this.exists = data?.memberCount > 0;
  }

  get inGroup () {
    return this.inChannel;
  }

  getAvatarUrl (size) {
    return this.iconInfo.get(size);
  }

  async getAvatar (size) {
    return this.client.utility.channel.avatar(this.id, size);
  }

  async join (password = undefined) {
    return await this.client.channel.joinById(this.id, password);
  }

  async leave () {
    return await this.client.channel.leaveById(this.id);
  }

  async stats () {
    return await this.client.channel.getStats(this.id);
  }

  async slots () {
    return await this.client.stage.slot.list(this.id);
  }

  async sendMessage (content, options = undefined) {
    return await this.client.messaging.sendChannelMessage(this.id, content, options);
  }

  async update ({ description, peekable, disableHyperlink, disableImage, disableImageFilter, disableVoice, longDescription, discoverable, language, category, advancedAdmin, questionable, locked, closed, entryLevel, avatar }) {
    return await this.client.channel.update(this.id, { description: description || this.description, peekable: peekable || this.peekable, disableHyperlink: disableHyperlink || this.messageConfig.disableHyperlink, disableImage: disableImage || this.messageConfig.disableImage, disableImageFilter: disableImageFilter || this.messageConfig.disableImageFilter, disableVoice: disableVoice || this.messageConfig.disableVoice, longDescription: longDescription || this.extended.longDescription, discoverable: discoverable || this.extended.discoverable, language: language || this.extended.language, category: category || this.extended.category, advancedAdmin: advancedAdmin || this.extended.advancedAdmin, questionable: questionable || this.extended.questionable, locked: locked || this.extended.locked, closed: closed || this.extended.closed, entryLevel: entryLevel || this.extended.entryLevel, avatar });
  }
}

export default Channel;
