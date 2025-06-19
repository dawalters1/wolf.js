import BaseEntity from './baseEntity';
import WOLF from '../client/WOLF';

export type ServerMetadata = {
    description: string;
    domain: string;
    imageSize: number;
    imageUrl: string;
    isOfficial: boolean;
    title: string
}

export class Metadata extends BaseEntity {
  description: string;
  domain: string;
  imageSize: number;
  imageUrl: string;
  isOfficial: boolean;
  title: string;

  constructor (client: WOLF, data: ServerMetadata) {
    super(client);

    this.description = data.description;
    this.domain = data.domain;
    this.imageSize = data.imageSize;
    this.imageUrl = data.imageUrl;
    this.isOfficial = data.isOfficial;
    this.title = data.title;
  }
}

export default Metadata;
