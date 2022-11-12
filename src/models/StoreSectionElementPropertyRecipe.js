import Base from './Base.js';

class StoreSectionElementPropertyRecipe extends Base {
  constructor (client, data) {
    super(client);
    this.id = data.id;
    this.min = data.min;
    this.max = data.max;
  }

  toJSON () {
    return {
      id: this.id,
      min: this.min,
      max: this.max
    };
  }
}

export default StoreSectionElementPropertyRecipe;
