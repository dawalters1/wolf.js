import Language from '../constants/Language.js';
import Privilege from '../constants/Privilege.js';
import patch from '../utils/patch.js';
import Base from './Base.js';
import IconInfo from './IconInfo.js';
import SubscriberExtended from './SubscriberExtended.js';
import SubscriberSelectedCharm from './SubscriberSelectedCharm.js';
import WOLFAPIError from './WOLFAPIError.js';

class Subscriber extends Base {
  constructor (client, data, subscribed) {
    super(client);

    this.charms = new SubscriberSelectedCharm(client, data?.charms, this.id);
    this.categoryIds = data?.categoryIds ?? [];
    this.deviceType = data?.deviceType;
    this.extended = new SubscriberExtended(client, data?.extended);
    this.hash = data?.hash;
    this.icon = data?.icon;
    this.iconHash = data?.iconHash;
    this.iconInfo = new IconInfo(client, data?.iconInfo, 'user', data?.id);
    this.id = data?.id;
    this.nickname = data?.nickname;
    this.onlineState = data?.onlineState;
    this.reputation = data?.reputation ?? 0;
    this.privileges = data?.privileges ?? 0;
    this.privilegeList = Object.values(Privilege).filter((value) => (this.privileges & value) === value);
    this.status = data?.status;
    this.language = client.utility.toLanguageKey(this?.extended?.language ?? Language.ENGLISH);

    this.exists = Object.keys(data)?.length > 1;
    this.subscribed = subscribed;
  }

  get percentage () {
    const reputation = (this.reputation.toString().split('.')[1] ?? '').padEnd(4, '0');

    return parseFloat(`${reputation[1].slice(0, 2)}.${reputation[1].slice(2)}`).toFixed(2);
  }

  /**
   * Get the subscribers avatar URL
   * @param {IconSize} size
   * @returns {string}
   */
  getAvatarUrl (size) {
    return this.iconInfo.get(size);
  }

  /**
   * Get the subscribers avatar
   * @param {IconSize} size
   * @returns {Promise<Buffer>}
   */
  async getAvatar (size) {
    return this.client.utility.subscriber.avatar(this.id, size);
  }

  /**
   * Add the subscriber to the bots blocked list
   * @returns {Promise<Response>}
   */
  async block () {
    return await this.client.contact.blocked.block(this.id);
  }

  /**
   * Remove the subscriber from the bots blocked list
   * @returns {Promise<Response>}
   */
  async unblock () {
    return await this.client.contact.blocked.unblock(this.id);
  }

  /**
   * Add the subscriber as a contact
   * @returns {Promise<Response>}
   */
  async add () {
    return await this.client.contact.add(this.id);
  }

  /**
   * Delete subscriber as a contact
   * @returns {Promise<Response>}
   */
  async delete () {
    return await this.client.contact.delete(this.id);
  }

  /**
   * Send a message to the subscriber
   * @param {String | Buffer} content
   * @param {MessageSendOptions} options
   * @returns {Promise<Response<MessageResponse>>}
   */
  async sendMessage (content, options = undefined) {
    return await this.client.messaging.sendPrivateMessage(this.id, content, options);
  }

  /**
   * Update the bots profile
   * @param {String} nickname
   * @param {String} status
   * @param {String} about
   * @param {Date} dateOfBirth
   * @param {Gender} gender
   * @param {Language} language
   * @param {LookingFor} lookingFor
   * @param {String} name
   * @param {Relationship} relationship
   * @param {String[]} urls
   * @param {Buffer} avatar
   * @param {Number[]} categoryIds
   * @returns {Promise<Response<unknown>>}
   */
  async update ({ nickname, status, about, dateOfBirth, gender, language, lookingFor, name, relationship, urls, avatar, categoryIds }) {
    if (this.id !== this.client.currentSubscriber.id) {
      throw new WOLFAPIError('subscriber is not logged in subscriber', { loggedInSubscriberId: this.client.currentSubscriber.id, currentProfileId: this.id });
    }

    return await this.client.update({ nickname, status, dateOfBirth, about, gender, language, lookingFor, name, relationship, urls, avatar, categoryIds });
  }

  toContact () {
    return {
      id: this.id,
      additionalInfo: {
        hash: this.hash,
        nicknameShort: this.nickname.slice(0, 6),
        onlineState: this.onlineState,
        privilieges: this.privileges,
        privilegeList: this.privilegeList
      }
    };
  }

  /**
   * Subscribe to profile updates
   * @returns {Promise<Subscriber>}
   */
  async subscribe () {
    const response = await this.client.subscriber.getById(this.id, true, true);

    patch(this, response);

    return response;
  }

  /**
   * Unsubscribe from profile updates
   * @returns {Promise<Response>}
   */
  async unsubscribe () {
    if (!this.subscribed) {
      throw new WOLFAPIError('not subscribed to profile updates', { id: this.id });
    }

    return await this.client.subscriber._unsubscribe(this.id);
  }
}

export default Subscriber;
