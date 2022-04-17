const GroupSubscriberManager = require('../manager/GroupSubscriberManager');
const Base = require('./Base');
const GroupAudioConfig = require('./GroupAudioConfig');
const GroupAudioCount = require('./GroupAudioCount');

const { Capability } = require('../constants');

class Group extends Base {
  constructor (api, data) {
    super(api);

    this._patch(data);

    this.id = data.id ?? 0;
    this.name = data.name ?? `<${this.id}>`;
    this.inGroup = data.inGroup ?? false;
    this.capabilities = data.capabilities ?? Capability.NOT_MEMBER;

    if (data.exists) {
      this.audioConfig = new GroupAudioConfig(data.audioConfig);
      this.audioCounts = new GroupAudioCount(data.audioCounts);
      this.subscribers = new GroupSubscriberManager(api, this);
      this.language = this.extended.language ? api.utility.toLanguageKey(this.extended.language) : api.config.get('app.defaultLanguage');
    }
  }

  async getAvatar (size = 128) {
    // TODO:
    return await this.api.utility.download(/** */);
  }

  async join (password = null) {
    return await this.api.group.joinById(this.id, password);
  }

  async leave () {
    return await this.api.group.leaveById(this.id);
  }

  update () {
    return this.api.group.update(this);
  }

  async updateAvatar (avatar) {
    return await this.api.group.updateAvatar(this.id, avatar);
  }

  async sendMessage (content, options = null) {
    return await this.api.messaging.sendGroupMessage(this.id, content, options);
  }
}

module.exports = Group;
