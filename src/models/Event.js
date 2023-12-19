import Base from './Base.js';

class Event extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.channelId = data?.groupId;
    this.groupId = this.channelId;
    this.createdBy = data?.createdBy;
    this.hostedBy = data?.hostedBy;
    this.title = data?.title;
    this.category = data?.category;
    this.shortDescription = data?.shortDescription;
    this.longDescription = data?.longDescription;
    this.imageUrl = data?.imageUrl;
    this.startsAt = data?.startsAt;
    this.endsAt = data?.endsAt;
    this.isRemoved = data?.isRemoved ?? false;
    this.attendanceCount = data?.attendanceCount;

    this.exists = Object.keys(data).length > 1;
  }

  /**
   * Add the event to the bots subscription list
   * @returns {Promise<Response>}
   */
  async subscribe () {
    return this.client.event.subscription.add(this.id);
  }

  /**
   * Remove the event from the bots subscription list
   * @returns {Promise<Response>}
   */
  async unsubscribe () {
    return this.client.event.subscription.remove(this.id);
  }

  /**
   * Update the event profile
   * @param {object} body
   * @param {string} body.title
   * @param {date}  body.startsAt
   * @param {date}  body.endsAt
   * @param {number} body.hostedBy
   * @param {number} body.category;
   * @param {string}  body.shortDescription
   * @param {string}  body.longDescription
   * @param {Buffer}  body.thumbnail
   * @returns {Promise<Response>}
   */
  async update ({ title, startsAt, hostedBy, category, endsAt, shortDescription = undefined, longDescription = undefined, thumbnail = undefined }) {
    return this.client.event.channel.update(this.channelId, this.id, { title, startsAt, endsAt, hostedBy, category, shortDescription, longDescription, thumbnail });
  }

  /**
   * Update the event thumbnail
   * @param {Buffer} thumbnail
   * @returns {Promise<Response>}
   */
  async updateThumbnail (thumbnail) {
    return this.client.event.channel.updateThumbnail(this.id, thumbnail);
  }

  async host (subscribe = true, forceNew = false) {
    if (!this.hostedBy) {
      return null;
    }

    return await this.client.subscriber.getById(this.hostedBy, subscribe, forceNew);
  }
}

export default Event;
