import BaseEntity from './BaseEntity.js';

export default class ExperienceBuild extends BaseEntity {
  constructor (client, entity) {
    super(client);

    this.experienceId = entity.experienceId ?? entity.id;
    this.contextType = entity.contextType;
    this.contextId = entity.contextId;
    this.type = entity.type ?? entity.buildType;
    this.displayName = entity.displayName;
    this.imageUrl = entity.imageUrl;
    this.version = entity.version;
    this.url = entity.url ?? entity.buildUrl;
    this.isActive = entity.isActive;
    this.latestVersion = entity.latestVersion;
    this.latestUrl = entity.latestUrl ?? entity.latestBuildUrl;
  }
}
