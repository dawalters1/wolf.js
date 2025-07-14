import Command from '../../constants/Command.js';
import TopicRecipe from '../../entities/topicRecipe.js';

class TopicRecipeHelper {
  constructor (client) {
    this.client = client;
  }

  // TODO: cache?
  async get (id, maxResults, languageId, type) {
    const get = async (results = []) => {
      const response = await this.client.websocket.emit(
        Command.TOPIC_PAGE_RECIPE_LIST,
        {
          body: {
            id,
            languageId,
            maxResults,
            offset: results.length,
            type: type.replace('liveGroupEvent', 'liveEvent').replace('groupEvent', 'event')
          }
        }
      );

      results.push(...response.body);

      return response.body.length < 50
        ? results
        : await get(results);
    };

    return (await get()).map((serverTopicRecipe) => new TopicRecipe(this.client, serverTopicRecipe, type));
  }
}

export default TopicRecipeHelper;
