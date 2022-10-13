import Base from './Base.js';
import CharmSelected from './CharmSelected.js';

class SubscriberSelectedCharm extends Base {
  constructor (client, data) {
    super(client);
    this.selectedList = (data?.selectedList ?? []).map((selected) => new CharmSelected(client, selected));
  }

  toJSON () {
    return {
      selectedList: this.selectedList.map((item) => item.toJSON())
    };
  }
}

export default SubscriberSelectedCharm;
