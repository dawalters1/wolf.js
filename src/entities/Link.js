import BaseEntity from './BaseEntity.js';
import getLinkPreviewData from '../util/getLinkPreviewData.js';

export default class Link extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.start = entity.start;
    this.end = entity.end;
    this.link = entity.link;
  }

  async preview () {
    return await getLinkPreviewData(this.link);
  }
}
