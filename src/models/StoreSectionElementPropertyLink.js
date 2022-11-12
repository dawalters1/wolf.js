import Base from './Base.js';

class StoreSectionElementPropertyLink extends Base {
  constructor (client, data) {
    super(client);
    this.url = data.url;
    this.text = data.url;
  }

  toJSON () {
    return {
      url: this.url,
      text: this.url
    };
  }
}

export default StoreSectionElementPropertyLink;
