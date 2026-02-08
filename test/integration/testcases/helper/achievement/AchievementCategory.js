// test/integration/achievement.test.js
import Common from '../../../resources/Common.js';
import { expect } from 'chai';
import initialiseClient from '../../utility/initialiseClient.js';
import { StatusCodes } from 'http-status-codes';
import WOLFResponse from '../../../../../src/entities/WOLFResponse.js';

let client;

describe('Achievement Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

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

    spy.restore();
  });

  it('should return AchievementCategory[] if achievement categories exist - From the server', async function () {
    const spy = Common.createMockRequest(
      'achievement category list',
      new WOLFResponse({
        code: StatusCodes.OK,
        body: [
          {
            id: 1,
            name: 'Test Name'
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
          name: String
        }
      );
    }
    Common.callCount(spy, 1);
    Common.calledWith('achievement category list', { body: { languageId: 1 } });

    spy.restore();
  });

  it('should return AchievementCategory[] if achievement categories exist - From cache', async function () {
    const spy = Common.createMockRequest(
      'achievement category list',
      new WOLFResponse({
        code: StatusCodes.OK,
        body: [
          {
            id: 1,
            name: 'Test Name'
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
          name: String
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
          name: String
        }
      );
    }
    Common.callCount(spy, 1);
    Common.calledWith('achievement category list', { body: { languageId: 1 } });

    spy.restore();
  });
});
