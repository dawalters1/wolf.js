import Base from './Base.js';
import StoreSection from './StoreSection.js';

class Store extends Base {
  constructor (client, credits, store, languageId) {
    super(client);

    this.id = store.id;
    this.title = store.title;
    this.languageId = languageId;
    this.credits = credits;
    this.sections = store.sectionList?.map((section) => new StoreSection(client, section, languageId));
  }

  /**
   * Get a page or section
   * @param {Number | String} value
   * @param {Number} offset
   * @returns {Promise<StoreSection | StorePage | Array<StoreProductPartial>>}
   */
  async get (value, offset = 0) {
    const section = (!value && this.sections.length === 1) ? this.sections[0] : this.sections.find((section) => section.id === value || this.client.utility.string.isEqual(section.title, value) || (section.page && this.client.utility.string.isEqual(section?.page, value)) || (section.recipe && section.recipe.id === value));

    return section ? await section.get(offset) : undefined;
  }

  /**
   * Get the available credit list
   * @returns {Promise<Array<StoreProductCredits>>}
   */
  async getCreditList () {
    if (this.credits) {
      return this.credits;
    }

    this.credits = await this.client.store.getCreditList(this.languageId);

    return this.credits;
  }
}

export default Store;
