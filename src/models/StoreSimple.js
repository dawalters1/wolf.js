import Base from './Base.js';
import StoreSectionSimple from './StoreSectionSimple.js';

class StoreSimple extends Base {
  constructor (client, data) {
    super(client);

    this.name = data?.name;
    this.title = data?.name;
    this.showBalance = data?.showBalance;

    this.sections = data?.sectionList?.map((section) => new StoreSectionSimple(this.client, section));
    // TODO
  }
}

export default StoreSimple;
