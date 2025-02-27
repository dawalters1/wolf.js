import Base from './Base.js';

class Achievement extends Base {
  constructor (client, data) {
    super(client);

    this.acquisitionPercentage = data?.acquisitionPercentage;
    this.category = data?.category;
    this.description = data?.description;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.levelId = data?.levelId;
    this.levelName = data?.levelName;
    this.name = data?.name;
    this.parentId = data?.parentId;
    this.typeId = data?.typeId;
  }
}

export default Achievement;
