import Base from './Base.js';
import StoreSectionElementProperties from './StoreSectionElementProperties.js';

class StoreSectionElement extends Base {
  constructor (client, data, languageId) {
    super(client);
    this.id = data.id;
    this.languageId = languageId;
    this.type = data.type;
    this.onInvalid = data.onInvalid;
    this.properties = new StoreSectionElementProperties(client, data.properties);
  }

  toJSON () {
    return {
      id: this.id,
      languageId: this.languageId,
      type: this.type,
      onInvalid: this.onInvalid,
      properties: this.properties.toJSON()
    };
  }
}

export default StoreSectionElement;
