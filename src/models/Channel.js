import Capability from '../constants/Capability.js';
import validator from '../validator/index.js';
import Base from './Base.js';
import ChannelAudioConfig from './ChannelAudioConfig.js';
import ChannelAudioCounts from './ChannelAudioCounts.js';
import ChannelEventManager from './ChannelEventManager.js';
import ChannelExtended from './ChannelExtended.js';
import ChannelMemberManager from './ChannelMemberManager.js';
import ChannelMemberList from './ChannelMemberManager.js';
import ChannelMessageConfig from './ChannelMessageConfig.js';
import ChannelRoleContainer from './ChannelRoleContainer.js';
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
    this.owner = new IdHash(this.client, data?.owner);
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
    this.members = new ChannelMemberManager();
    this.verificationTier = data?.verificationTier;
    this.roles = new ChannelRoleContainer(client, data?.id);
    this.inChannel = false;
    this.capabilities = Capability.NOT_MEMBER;

    this.exists = data?.memberCount > 0;
    this._events = new ChannelEventManager(client);
  }

  get inGroup () {
    return this.inChannel;
  }

  get isOwner(){
    return this.owner.id === this.client.currentSubscriber.id;
  }

  get percentage () {
    const reputation = (this.reputation.toString().split('.')[1] ?? '').padEnd(4, '0');

    return parseFloat(`${reputation[1].slice(0, 2)}.${reputation[1].slice(2)}`).toFixed(2);
  }

  async stages (forceNew = false) {
    return await this.client.stage.getAvailableStages(this.id, forceNew);
  }

  async events (subscribe = true, forceNew = false) {
    return await this.client.event.channel.getList(this.id, subscribe, forceNew);
  }

  /**
   * Get the channel avatar URL
   * @param {IconSize} size
   * @returns {String}
   */
  getAvatarUrl (size) {
    return this.iconInfo.get(size);
  }

  /**
   * Get the channel avatar
   * @param {IconSize} size
   * @returns {Promise<Buffer>}
   */
  async getAvatar (size) {
    return this.client.utility.channel.avatar(this.id, size);
  }

  /**
   * Join the channel
   * @param password
   * @returns {Promise<Response>}
   */
  async join (password = undefined) {
    return await this.client.channel.joinById(this.id, password);
  }

  /**
   * Leave the channel
   * @returns {Promise<Response>}
   */
  async leave () {
    return await this.client.channel.leaveById(this.id);
  }

  /**
   * Get the channels stats
   * @returns {Promise<ChannelStats>}
   */
  async stats () {
    return await this.client.channel.getStats(this.id);
  }

  /**
   * Get the channels audio slots
   * @returns {Promise<function(): Promise<Array<ChannelAudioSlot>>>}
   */
  async slots () {
    return await this.client.stage.slot.list(this.id);
  }

  /**
   * Send a message in the channel
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response<MessageResponse>>}
   */
  async sendMessage (content, options = undefined) {
    return await this.client.messaging.sendChannelMessage(this.id, content, options);
  }

  /**
   * Update the channels profile
   * @param {Object} body
   * @param {String} body.description
   * @param {Boolean} body.peekable
   * @param {Boolean} body.disableHyperlink
   * @param {Boolean} body.disableImage
   * @param {Boolean} body.disableImageFilter
   * @param {Boolean} body.disableVoice
   * @param {number} body.slowModeRateInSeconds
   * @param {String} body.longDescription
   * @param {Boolean} body.discoverable
   * @param {Number} body.language
   * @param {Category} body.category
   * @param {Boolean} body.advancedAdmin
   * @param {Boolean} body.questionable
   * @param {Boolean} body.locked
   * @param {Boolean} body.closed
   * @param {Number} body.entryLevel
   * @param {Buffer} body.avatar
   * @returns {Promise<Response>}
   */
  async update ({ description, peekable, disableHyperlink, disableImage, disableImageFilter, disableVoice, slowModeRateInSeconds, longDescription, discoverable, language, category, advancedAdmin, questionable, locked, closed, entryLevel, avatar }) {
    return await this.client.channel.update(this.id, { description: description || this.description, peekable: peekable || this.peekable, disableHyperlink: disableHyperlink || this.messageConfig.disableHyperlink, disableImage: disableImage || this.messageConfig.disableImage, disableImageFilter: disableImageFilter || this.messageConfig.disableImageFilter, disableVoice: disableVoice || this.messageConfig.disableVoice, longDescription: longDescription || this.extended.longDescription, discoverable: discoverable || this.extended.discoverable, language: language || this.extended.language, category: category || this.extended.category, advancedAdmin: advancedAdmin || this.extended.advancedAdmin, questionable: questionable || this.extended.questionable, locked: locked || this.extended.locked, closed: closed || this.extended.closed, entryLevel: entryLevel || this.extended.entryLevel, avatar, slowModeRateInSeconds: validator.isNullOrUndefined(slowModeRateInSeconds) ? this.messageConfig.slowModeRateInSeconds : slowModeRateInSeconds });
  }

  async tipLeaderboardSummary (tipPeriod, tipType, tipDirection) {
    return await this.client.tipping.getChannelLeaderboardSummary(this.id, tipPeriod, tipType, tipDirection);
  }

  async tipLeaderboard (tipPeriod, tipType, tipDirection) {
    return await this.client.tipping.getChannelLeaderboard(this.id, tipPeriod, tipType, tipDirection);
  }
}

export default Channel;
