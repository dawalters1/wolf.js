import BaseEntity from './BaseEntity.js';
import TopicPageSection from './TopicPageSection.js';

export default class TopicPage extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.name = entity.name;
    this.languageId = entity.languageId;
    this.id = entity.id;
    this.title = entity.title;
    this.showBalance = entity.showBalance;
    this.sectionList = new Set(entity.sectionList.map((serverSection) => {
      serverSection.languageId = entity.languageId;
      return new TopicPageSection(this.client, serverSection);
    }));
  }
}
