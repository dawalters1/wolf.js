import AvatarUrl from './AvatarUrl.js';
import BaseEntity from './BaseEntity.js';
import ChannelGiftItem from './ChannelGiftItem.js';
import IdHash from './IdHash.js';

export default class ChannelGiftSummary extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.avatarUrl = new AvatarUrl(client, entity.avatarUrl);
    this.createdAt = new Date(entity.createdAt);
    this.creditPurchaseId = entity.creditPurchaseId;
    this.credits = entity.credits;
    this.gifts = entity.gifts;
    this.hash = entity.hash;
    this.name = entity.name;
    this.requesterIsTarget = entity.requesterIsTarget;
    this.userId = entity.subscriberId;
    this.targets = entity.targets;
    this.tier = entity.tier;
    this.giftItemList = entity.giftItemList
      ? entity.giftItemList.map((giftItem) => new ChannelGiftItem(client, giftItem))
      : null;
    this.targetList = entity.targetList
      ? entity.targetList.map((target) => new IdHash(client, target, false))
      : null;
  }
}
