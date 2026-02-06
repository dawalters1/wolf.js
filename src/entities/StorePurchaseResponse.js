import BaseEntity from './BaseEntity.js';
import WOLFResponse from './WOLFResponse.js';

export default class StorePurchaseResponse extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.totalCost = entity.totalCost;
    this.responseList = entity.responseList.map((response) => new WOLFResponse(response));
  }
}
