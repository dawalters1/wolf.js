import BaseEntity from './baseEntity.js';
import TopicPageSection from './topicPageSection.js';

export class TopicPage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.name = entity.name;
    this.id = new Map([[entity.languageId, entity.id]]);
    this.title = new Map([[entity.languageId, entity.title]]);
    this.showBalance = new Map([[entity.languageId, entity.showBalance]]);
    this.sectionList = new Map([[entity.languageId, new Set(entity.sectionList.map((serverSection) => new TopicPageSection(this.client, serverSection, entity.languageId)))]]);
  }
}

export default TopicPage;
