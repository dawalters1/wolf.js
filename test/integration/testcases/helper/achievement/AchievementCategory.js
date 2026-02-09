
import Common from '../../../resources/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';
import sinon from 'sinon';
import { StatusCodes } from 'http-status-codes';
import WOLFResponse from '../../../../../src/entities/WOLFResponse.js';

/** @type {import('../../../../../frameworks/wolf.js/src/client/WOLF.js').default} */
let client;

describe('AchievementCategory Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('fetch', () => {
    it('should return AchievementCategory[] if no achievement categories exist', async function () {
      const spy = Common.createMockRequest(
        'achievement category list',
        new WOLFResponse({
          code: StatusCodes.NOT_FOUND
        })
      );

      const achievementCategories = await client.achievement.category.fetch(1);
      Common.isNotNullOrUndefined(achievementCategories);
      Common.length(achievementCategories, 0);
      Common.callCount(spy, 1);
      Common.calledWith('achievement category list', { body: { languageId: 1 } });
    });

    it('should return AchievementCategory[] if achievement categories exist - From the server', async function () {
      const spy = Common.createMockRequest(
        'achievement category list',
        new WOLFResponse({
          code: StatusCodes.OK,
          body: [
            {
              id: 1,
              name: 'Test Name',
              languageId: 1
            }
          ]
        })
      );

      const achievementCategories = await client.achievement.category.fetch(1, { forceNew: true });
      Common.isNotNullOrUndefined(achievementCategories);
      Common.length(achievementCategories, 1);

      for (const achievementCategory of achievementCategories) {
        Common.isMatch(
          achievementCategory,
          {
            id: Number,
            name: String,
            languageId: Number
          }
        );
      }
      Common.callCount(spy, 1);
      Common.calledWith('achievement category list', { body: { languageId: 1 } });
    });

    it('should return AchievementCategory[] if achievement categories exist - From cache', async function () {
      const spy = Common.createMockRequest(
        'achievement category list',
        new WOLFResponse({
          code: StatusCodes.OK,
          body: [
            {
              id: 1,
              name: 'Test Name',
              languageId: 1
            }
          ]
        })
      );

      const achievementCategoriesPrior = await client.achievement.category.fetch(1, { forceNew: true });
      Common.isNotNullOrUndefined(achievementCategoriesPrior);
      Common.length(achievementCategoriesPrior, 1);

      for (const achievementCategory of achievementCategoriesPrior) {
        Common.isMatch(
          achievementCategory,
          {
            id: Number,
            name: String,
            languageId: Number
          }
        );
      }

      const achievementCategoriesAfter = await client.achievement.category.fetch(1);
      Common.isNotNullOrUndefined(achievementCategoriesAfter);
      Common.length(achievementCategoriesAfter, 1);

      for (const achievementCategory of achievementCategoriesAfter) {
        Common.isMatch(
          achievementCategory,
          {
            id: Number,
            name: String,
            languageId: Number
          }
        );
      }
      Common.callCount(spy, 1);
      Common.calledWith('achievement category list', { body: { languageId: 1 } });
    });
  });
});
