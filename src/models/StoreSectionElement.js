import Base from './Base.js';
import StoreSectionElementProperties from './StoreSectionElementProperties.js';

class StoreSectionElement extends Base {
  constructor (client, data) {
    super(client);

    this.type = data.type;
    this.onInvalid = data.onInvalid;
    this.properties = new StoreSectionElementProperties(client, data.properties);
  }

  toJSON () {
    return {
      type: this.type,
      onInvalid: this.onInvalid,
      properties: this.properties.toJSON()
    };
  }
}

export default StoreSectionElement;
