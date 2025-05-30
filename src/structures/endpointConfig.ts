import WOLF from '../client/WOLF.ts';
import BaseEntity from './baseEntity.ts';

export interface ServerEndpointConfig {
  avatarEndpoint: string;
  mmsUploadEndpoint: string;
}

export class EndpointConfig extends BaseEntity {
  avatarEndpoint: string;
  mmsUploadEndpoint: string;

  constructor (client: WOLF, data: ServerEndpointConfig) {
    super(client);
    this.avatarEndpoint = data.avatarEndpoint;
    this.mmsUploadEndpoint = data.mmsUploadEndpoint;
  }
}

export default EndpointConfig;
