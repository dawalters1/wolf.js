import BaseEntity from './baseEntity.js';
import TopicPageSection from './topicPageSection.js';

export class TopicPage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.name = entity.name;
    this.languageId = entity.languageId;
    this.id = entity.id;
    this.title = entity.title;
    this.showBalance = entity.showBalance;
    this.sectionList = new Map([[entity.languageId, new Set(entity.sectionList.map((serverSection) => new TopicPageSection(this.client, serverSection, entity.languageId)))]]);
  }
}

export default TopicPage;
