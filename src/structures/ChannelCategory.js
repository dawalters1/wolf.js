import Base from './Base.js';

class ChannelCategory extends Base {
  constructor (client, data) {
    super(client);

    this.description = data?.description;
    this.id = data?.id;
    this.imageUrl = data?.imageUrl;
    this.pageName = data?.pageName;
    this.recipeId = data?.recipeId;
  }
}

export default ChannelCategory;
