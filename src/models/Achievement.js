import Base from './Base.js';

class Achievement extends Base {
  constructor (client, data) {
    super(client);
    this.id = data?.id;
    this.parentId = data?.parentId;
    this.typeId = data?.typeId;
    this.name = data?.name;
    this.description = data?.description;
    this.imageUrl = data?.imageUrl;
    this.category = data?.category;
    this.levelId = data?.levelId;
    this.levelName = data?.levelName;
    this.acquisitionPercentage = data?.acquisitionPercentage;

    this.exists = Object.keys(data).length > 1;
  }
}

export default Achievement;
