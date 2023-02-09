import Base from './Base.js';

class LinkMetadata extends Base {
  constructor (client, data) {
    super(client);
    this.description = data?.description;
    this.domain = data?.domain;
    this.imageSize = data?.imageSize;
    this.imageUrl = data?.imageUrl;
    this.isOfficial = data?.isOfficial;
    this.title = data?.title;
  }
}

export default LinkMetadata;
