import Base from './Base.js';
import { StoreSectionElementPropertyRecipe } from './index.js';
import StoreSectionElementPropertyAspect from './StoreSectionElementPropertyAspect.js';
import StoreSectionElementPropertyLink from './StoreSectionElementPropertyLink.js';

class StoreSectionElementProperties extends Base {
  constructor (client, data) {
    super(client);

    this.aspect = data.aspect ? new StoreSectionElementPropertyAspect(client, data.aspect) : undefined;
    this.link = data.link ? new StoreSectionElementPropertyLink(client, data.link) : undefined;
    this.recipe = data.recipe ? new StoreSectionElementPropertyRecipe(client, data.recipe) : undefined;
    this.onInvalid = data.onInvalid;
    this.context = data.context;
    this.size = data.size;
    this.style = data.style;
    this.text = data.text;
    this.type = data.type;
    this.url = data.url;
  }

  toJSON () {
    return {
      aspect: this.aspect?.toJSON(),
      link: this.link?.toJSON(),
      recipe: this.recipe?.toJSON(),
      onInvalid: this.onInvalid,
      content: this.context,
      style: this.style,
      text: this.text,
      type: this.type,
      url: this.url
    };
  }
}

export default StoreSectionElementProperties;
