import BaseEntity from './BaseEntity.js';
import ExperienceBuild from './ExperienceBuild.js';
import ExperienceSessionUser from './ExperienceSessionUser.js';

export default class ExperienceSession extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.user = new ExperienceSessionUser(this.client, entity.user);
    this.token = entity.token;
    this.platform = entity.platform;
    this.contextType = entity.contextType;
    this.contextId = entity.contextId;
    this.screenState = entity.screenState;
    this.screenStatePreviously = entity.screenStatePreviously;
    this.data = entity.data;
    this.experience = entity.experience
      ? new ExperienceBuild(
        client,
        {
          ...entity.experience,
          contextId: entity.contextId,
          contextType: entity.contextType
        }
      )
      : null;
  }
}
