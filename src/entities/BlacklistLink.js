import BaseEntity from './BaseEntity.js';

export default class BlackListLink extends BaseEntity {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.regex = data?.regex;
  }
}
