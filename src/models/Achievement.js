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
  }

  toJSON () {
    return {
      id: this.id,
      parentId: this.parentId,
      typeId: this.typeId,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      category: this.category,
      levelId: this.levelId,
      levelName: this.levelName,
      acquisitionPercentage: this.acquisitionPercentage
    };
  }
}

export default Achievement;
