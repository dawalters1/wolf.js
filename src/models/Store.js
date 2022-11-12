import Base from './Base.js';
import StoreSection from './StoreSection.js';

class Store extends Base {
  constructor (client, data, languageId) {
    super(client);
    this.id = data.id;
    this.languageId = languageId;
    this.title = data.title;
    this.sections = data?.sectionList.map((element) => new StoreSection(client, element, languageId));
  }

  async get (value) {
    const page = await this.sections.find((section) => section.id === value || section.elements.some((element) => this.client.utility.string.isEqual(element.properties?.text, value) || (element.type === 'heading' && this.client.utility.string.isEqual(element.properties?.link?.url?.split('/').slice(-1)[0], value))))?.get() ?? undefined;

    if (page && page.sections?.length === 1) {
      return await page.sections[0].get();
    }

    return page;
  }

  toJSON () {
    return {
      id: this.id,
      languageId: this.languageId,
      title: this.title,
      sections: this.sections?.map((section) => section.toJSON()) ?? []
    };
  }
}

export default Store;
