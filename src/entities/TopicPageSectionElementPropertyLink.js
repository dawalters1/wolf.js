import BaseEntity from './BaseEntity.js';

const topicPageLinks = [
  'https://wolf.live/p/',
  'https://app.wolf.live/p/',
  'https://wolf.live/store/'
];

export default class TopicPageSectionElementPropertyLink extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.text = entity?.text ?? null;
    this.url = entity?.url ?? null;
    this.topicPageName = topicPageLinks.some((link) => this.url.startsWith(link))
      ? this.url?.split('/')?.at(-1)
      : null;
  }
}
