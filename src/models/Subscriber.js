import Language from '../constants/Language.js';
import patch from '../utils/patch.js';
import Base from './Base.js';
import IconInfo from './IconInfo.js';
import SubscriberExtended from './SubscriberExtended.js';
import SubscriberSelectedCharm from './SubscriberSelectedCharm.js';
import WOLFAPIError from './WOLFAPIError.js';

class Subscriber extends Base {
  constructor (client, data, subscribed) {
    super(client);
    this.charms = new SubscriberSelectedCharm(client, data?.charms);
    this.deviceType = data?.deviceType;
    this.extended = new SubscriberExtended(client, data?.extended);
    this.hash = data?.hash;
    this.icon = data?.icon;
    this.iconHash = data?.iconHash;
    this.iconInfo = new IconInfo(client, data?.iconInfo, 'user', data?.id);
    this.id = data?.id;
    this.nickname = data?.nickname;
    this.onlineState = data?.onlineState;
    this.reputation = data?.reputation;
    this.privileges = data?.privileges;
    this.status = data?.status;
    this.language = client.utility.toLanguageKey(this?.extended?.language ?? Language.ENGLISH);

    this.exists = Object.keys(data)?.length > 1;
    this.subscribed = subscribed;
  }

  getAvatarUrl (size) {
    return this.iconInfo.get(size);
  }

  async getAvatar (size) {
    return this.client.utility.subscriber.avatar(this.id, size);
  }

  async block () {
    return await this.client.contact.blocked.block(this.id);
  }

  async unblock () {
    return await this.client.contact.blocked.unblock(this.id);
  }

  async add () {
    return await this.client.contact.add(this.id);
  }

  async delete () {
    return await this.client.contact.delete(this.id);
  }

  async sendMessage (content, options = undefined) {
    return await this.client.messaging.sendPrivateMessage(this.id, content, options);
  }

  async update ({ nickname, status, about, dateOfBirth, gender, language, lookingFor, name, relationship, urls, avatar }) {
    if (this.id !== this.client.currentSubscriber.id) {
      throw new WOLFAPIError('subscriber is not logged in subscriber', { loggedInSubscriberId: this.client.currentSubscriber.id, currentProfileId: this.id });
    }

    return await this.client.update({ nickname, status, dateOfBirth, about, gender, language, lookingFor, name, relationship, urls, avatar });
  }

  toContact () {
    return {
      id: this.id,
      additionalInfo: {
        hash: this.hash,
        nicknameShort: this.nickname.slice(0, 6),
        onlineState: this.onlineState,
        privilieges: this.privilieges
      }
    };
  }

  async subscribe () {
    const response = await this.client.subscriber.getById(this.id, true, true);

    patch(this, response);

    return response;
  }

  async unsubscribe () {
    if (!this.subscribed) {
      throw new WOLFAPIError('not subscribed to profile updates', { id: this.id });
    }

    return await this.client.subscriber._unsubscribe(this.id);
  }
}

export default Subscriber;
