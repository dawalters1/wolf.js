import Base from './Base.js';

class ChannelCategory extends Base {
  constructor (client, data) {
    super(client);

    this.id = data?.id;
    this.description = data?.description;
    this.imageUrl = data?.imageUrl;
    this.name = data?.name;
    this.pageName = data?.pageName;
    this.recipeId = data?.recipeId;
  }
}

export default ChannelCategory;
