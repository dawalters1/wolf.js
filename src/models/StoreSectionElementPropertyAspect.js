import Base from './Base.js';

class StoreSectionElementPropertyAspect extends Base {
  constructor (client, data) {
    super(client);
    this.width = data.width;
    this.height = data.height;
  }

  toJSON () {
    return {
      width: this.width,
      height: this.height
    };
  }
}

export default StoreSectionElementPropertyAspect;
