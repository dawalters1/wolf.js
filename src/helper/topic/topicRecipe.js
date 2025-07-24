import TopicRecipeManager from '../../managers/topicRecipeManager.js';

class TopicRecipeHelper {
  constructor (client) {
    this.client = client;
    this.cache = new TopicRecipeManager();
  }
/*
  async get (id, languageId, type, opts) {
    id = Number(id) || id;
    languageId = Number(languageId) || languageId;

    { // eslint-disable-line no-lone-blocks
      validate(id)
        .isNotNullOrUndefined('TopicRecipeHelper.get() parameter, productId[{index}]: {value} is null or undefined')
        .isValidNumber('TopicRecipeHelper.get() parameter, productId[{index}]: {value} is not a valid number')
        .isGreaterThanZero('TopicRecipeHelper.get() parameter, productId[{index}]: {value} is less than or equal to zero');

      validate(languageId)
        .isNotNullOrUndefined(`TopicRecipeHelper.get() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(Language, `TopicRecipeHelper.get() parameter, languageId: ${languageId} is not valid`);

      validate(type)
        .isNotNullOrUndefined(`TopicRecipeHelper.get() parameter, languageId: ${languageId} is null or undefined`)
        .isValidConstant(TopicPageRecipeType, `TopicRecipeHelper.get() parameter, languageId: ${languageId} is not valid`);

      validate(opts)
        .isNotRequired()
        .isValidObject({ forceNew: Boolean }, 'TopicRecipeHelper.get() parameter, opts.{parameter}: {value} {error}');
    }

    if (!opts?.forceNew) {
      const cached = this.cache.get(id, languageId);

      if (cached) {
        return [...cached.values()];
      }
    }

    try {
      const get = async (results = []) => {
        const response = await this.client.websocket.emit(
          Command.TOPIC_PAGE_RECIPE_LIST,
          {
            body: {
              id,
              languageId,
              maxResults: 50,
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

      const topicRecipeList = (await get())
        .map((serverTopicRecipe) => new TopicRecipe(this.client, { ...serverTopicRecipe, recipeId: id }, id, type));

      return [
        ...this.cache.set(
          id,
          languageId,
          new Set(topicRecipeList),
          response.headers?.maxAge
        ).values()
      ];
    } catch (error) {
      if (error.code === StatusCodes.NOT_FOUND) { return []; }
      throw error;
    }
  } */
}

export default TopicRecipeHelper;
