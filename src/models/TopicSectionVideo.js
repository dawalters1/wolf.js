import Base from './Base.js';
import TopicSectionVideoAspect from './TopicSectionVideoAspect.js';

class TopicSectionVideo extends Base {
  constructor (client, data) {
    super(client);

    this.aspect = new TopicSectionVideoAspect(client, data?.aspect);
    this.autoplay = data?.autoplay;
    this.loop = data?.loop;
    this.muted = data?.muted;
    this.url = data?.url;
  }

  toJSON () {
    return {
      aspect: this.aspect.toJSON(),
      autoplay: this.autoplay,
      loop: this.loop,
      muted: this.muted,
      url: this.url
    };
  }
}

export default TopicSectionVideo;
