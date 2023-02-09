import Base from './Base.js';

class TopicSectionVideoAspect extends Base {
  constructor (client, data) {
    super(client);

    this.width = data?.width;
    this.height = data?.height;
  }
}

export default TopicSectionVideoAspect;
