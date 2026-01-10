import BaseEntity from './BaseEntity.js';
import TopicPageSectionColour from './TopicPageSectionColour.js';
import TopicPageSectionElement from './TopicPageSectionElement.js';
import TopicPageSectionValidity from './TopicPageSectionValidity.js';

export default class TopicPageSection extends BaseEntity {
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
