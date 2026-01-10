import BaseEntity from './baseEntity.js';
import TopicPageSectionColour from './topicPageSectionColour.js';
import TopicPageSectionElement from './topicPageSectionElement.js';
import TopicPageSectionValidity from './topicPageSectionValidity.js';

export class TopicPageSection extends BaseEntity {
  constructor (client, entity, languageId) {
    super(client);

    this.id = entity.id;
    this.validity = entity?.validity
      ? new TopicPageSectionValidity(this.client, entity.validity)
      : null;
    this.colour = entity.colour
      ? new TopicPageSectionColour(this.client, entity.colour)
      : null;
    this.elementList = entity.elementList?.map((element) =>
      new TopicPageSectionElement(this.client, element, languageId)
    );
  }
}

export default TopicPageSection;
