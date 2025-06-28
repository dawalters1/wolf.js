import BaseEntity from './baseEntity.js';

class EndpointConfig extends BaseEntity {
  constructor (client, entity) {
    super(client);
    this.avatarEndpoint = entity.avatarEndpoint;
    this.mmsUploadEndpoint = entity.mmsUploadEndpoint;
  }
}
export default EndpointConfig;
