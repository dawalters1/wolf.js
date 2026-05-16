import BaseHelper from '../BaseHelper.js';
import ContextType from '../../constants/ContextType.js';
import ExperienceBuild from '../../entities/ExperienceBuild.js';
import ExperienceBuildType from '../../constants/ExperienceBuildType.js';
import ExperienceContextType from '../../constants/ExperienceContextType.js';
import ExperienceSession from '../../entities/ExperienceSession.js';
import Language from '../../constants/Language.js';
import { StatusCodes } from 'http-status-codes';
import { validate } from '../../validation/Validation.js';

export default class ExperienceHelper extends BaseHelper {
  constructor (client) {
    super(client, { ttl: 60 });
  }

  async #fetchExperienceItemList (languageId, contextType, contextId, gameIdList, opts) {
    const idsToFetch = opts?.forceNew
      ? gameIdList
      : gameIdList.filter(
        (experienceId) =>
          !this.store.has(
            (item) => item.id === experienceId && item.languageId === languageId && item.contextType === contextType && item.contextId === contextId
          )
      );

    if (idsToFetch.length) {
      const response = await this.client.websocket.emit(
        'experience item list',
        {
          body: {
            idList: idsToFetch,
            languageId,
            contextId,
            contextType
          }
        }
      );

      const maxAge = response.headers?.maxAge;

      for (const [index, childResponse] of response.body.entries()) {
        const experienceId = idsToFetch[index];

        if (!childResponse.success) {
          this.store.delete(
            (item) => item.id === experienceId && item.languageId === languageId && item.contextType === contextType && item.contextId === contextId
          );
          continue;
        }

        this.store.set(
          new ExperienceBuild(this.client, childResponse.body),
          maxAge
        );
      }
    }

    return gameIdList.map((experienceId) =>
      this.store.get(
        (item) => item.id === experienceId && item.languageId === languageId && item.contextType === contextType && item.contextId === contextId
      )
    );
  }

  async #fetchExperienceList (languageId, contextType, contextId, opts) {
    if (!opts?.forceNew) {
      const cached = this.store.filter((item) => item.contextType === contextType && item.contextId === contextId && item.languageId === languageId);

      if (cached.length) { return cached; }
    }

    const response = await this.client.websocket.emit(
      'experience build list',
      {
        body: {
          clientToken: this.client.config.framework.login.token,
          languageId,
          contextType,
          contextId
        }
      }
    );

    return response.body.map((serverExperienceBuild) => {
      serverExperienceBuild.contextId = contextId;
      serverExperienceBuild.contextType = contextType;
      return this.store.set(
        new ExperienceBuild(this.client, serverExperienceBuild)
      );
    });
  }

  async #fetchExperience (experienceId, experienceBuildType, languageId, contextType, contextId, opts) {
    if (!opts?.forceNew) {
      const cached = this.store.get((item) => item.experienceId === experienceId && item.type === experienceBuildType && item.contextType === contextType && item.contextId === contextId && item.languageId === languageId);

      if (cached) { return cached; }
    }
    try {
      const response = await this.client.websocket.emit(
        'experience build',
        {
          body: {
            experienceId,
            experienceBuildType,
            clientToken: this.client.config.framework.login.token,
            languageId,
            contextType,
            contextId
          }
        }
      );

      return this.store.set(
        new ExperienceBuild(this.client,
          {
            ...response.body,
            contextId,
            contextType
          }
        )
      );
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
      return null;
    }
  }

  async fetch (...args) {
    const validateContext = (languageId, contextType, contextId) => {
      const normalisedLanguageId = this.normaliseNumber(languageId);
      const normalisedContextId = this.normaliseNumber(contextId);

      validate(normalisedLanguageId, this, this.fetch)
        .isNotNullOrUndefined()
        .in(Object.values(Language));

      validate(contextType, this, this.fetch)
        .isNotNullOrUndefined()
        .in(Object.values(ExperienceContextType));

      if ([ExperienceContextType.CHANNEL, ExperienceContextType.PRIVATE].includes(contextType)) {
        validate(normalisedContextId, this, this.fetch)
          .isNotNullOrUndefined()
          .isValidNumber()
          .isNumberGreaterThanZero();
      }

      return {
        normalisedLanguageId,
        normalisedContextId
      };
    };

    const validateOpts = opts => {
      validate(opts, this, this.fetch)
        .isNotRequired()
        .forEachProperty({
          forceNew: validator => validator
            .isNotRequired()
            .isBoolean()
        });
    };

    // fetch(languageId, contextType, contextId, gameIdList, opts?)
    if (
      args.length >= 4 &&
    Object.values(Language).includes(args[0]) &&
    Object.values(ContextType).includes(args[1])
    ) {
      const [
        languageId,
        contextType,
        contextId,
        gameIdList,
        opts
      ] = args;

      const {
        normalisedLanguageId,
        normalisedContextId
      } = validateContext(languageId, contextType, contextId);

      const normalisedGameIdList = this.normaliseNumbers(gameIdList);

      validate(gameIdList, this, this.fetch)
        .isArray()
        .noDuplicates()
        .each()
        .isNotNullOrUndefined()
        .isValidNumber()
        .isNumberGreaterThanZero();

      validateOpts(opts);

      return this.#fetchExperienceItemList(
        normalisedLanguageId,
        contextType,
        normalisedContextId,
        normalisedGameIdList,
        opts
      );
    }

    // fetch(experienceId, experienceBuildType, languageId, contextType, contextId, opts?)
    if (args.length >= 5) {
      if (!this.client.loggedIn) {
        throw new Error('Bot is not logged in');
      }

      const [
        experienceId,
        experienceBuildType,
        languageId,
        contextType,
        contextId,
        opts
      ] = args;

      const normalisedExperienceId = this.normaliseNumber(experienceId);

      validate(normalisedExperienceId, this, this.fetch)
        .isNotNullOrUndefined()
        .isValidNumber()
        .isNumberGreaterThanZero();

      validate(experienceBuildType, this, this.fetch)
        .isNotNullOrUndefined()
        .in(Object.values(ExperienceBuildType));

      const {
        normalisedLanguageId,
        normalisedContextId
      } = validateContext(languageId, contextType, contextId);

      validateOpts(opts);

      return this.#fetchExperience(
        normalisedExperienceId,
        experienceBuildType,
        normalisedLanguageId,
        contextType,
        normalisedContextId,
        opts
      );
    }

    // fetch(languageId, contextType, contextId, opts?)
    if (args.length >= 3) {
      const [
        languageId,
        contextType,
        contextId,
        opts
      ] = args;

      const {
        normalisedLanguageId,
        normalisedContextId
      } = validateContext(languageId, contextType, contextId);

      validateOpts(opts);

      return this.#fetchExperienceList(
        normalisedLanguageId,
        contextType,
        normalisedContextId,
        opts
      );
    }

    throw new Error(`Unexpected arg length of ${args.length} expected >=3 or >=5`);
  }

  async session (languageId) {
    if (!this.client.loggedIn) { throw new Error('Bot is not logged in'); }

    try {
      const response = await this.client.websocket.emit(
        'experience session',
        {
          body: {
            clientToken: this.client.config.framework.login.token,
            languageId
          }
        }
      );

      return new ExperienceSession(this.client, response.body);
    } catch (error) {
      if (error.code !== StatusCodes.NOT_FOUND) { throw error; }
      return null;
    }
  }
}
