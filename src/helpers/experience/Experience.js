import BaseHelper from '../BaseHelper.js';
import ExperienceBuild from '../../entities/ExperienceBuild.js';
import ExperienceSession from '../../entities/ExperienceSession.js';
import { StatusCodes } from 'http-status-codes';

export default class ExperienceHelper extends BaseHelper {
  constructor (client) {
    super(client, { ttl: 60 });
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
    // fetch(experienceId, experienceBuildType, languageId, contextType, contextId, opts?)
    if (args.length >= 5) {
      const [
        experienceId,
        experienceBuildType,
        languageId,
        contextType,
        contextId,
        opts = {}
      ] = args;

      const normalisedExperienceId = this.normaliseNumber(experienceId);
      const normalisedLanguageId = this.normaliseNumber(languageId);
      const normalisedContextId = this.normaliseNumber(contextId);

      return await this.#fetchExperience(normalisedExperienceId, experienceBuildType, normalisedLanguageId, contextType, normalisedContextId, opts);
    } // eslint-disable-line brace-style

    // fetch(languageId, contextType, contextId, opts?)
    else if (args.length >= 3) {
      const [
        languageId,
        contextType,
        contextId,
        opts = {}
      ] = args;

      const normalisedLanguageId = this.normaliseNumber(languageId);
      const normalisedContextId = this.normaliseNumber(contextId);

      return await this.#fetchExperienceList(normalisedLanguageId, contextType, normalisedContextId, opts);
    }

    throw new Error(`Unexpected arg length of ${args.length} expected >=3 or >=5`);
  }

  async session (languageId) {
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
