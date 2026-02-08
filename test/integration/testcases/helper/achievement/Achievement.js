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

  it("should return null if an achievement doesn't exist", async function () {
    const spy = Common.createMockRequest(
      'achievement',
      new WOLFResponse({
        code: StatusCodes.MULTI_STATUS,
        body: { 0: new WOLFResponse({ code: StatusCodes.NOT_FOUND }) }
      })
    );

    const achievement = await client.achievement.fetch(354000, 1);
    Common.isNull(achievement);
    Common.callCount(spy, 1);
    Common.calledWith('achievement', { body: { idList: [354000], languageId: 1 } });

    spy.restore();
  });

  it('should return Achivement if an achievement exists - From the server', async function () {
    const spy = Common.createMockRequest(
      'achievement',
      new WOLFResponse({
        code: StatusCodes.MULTI_STATUS,
        body: {
          0: new WOLFResponse({
            code: StatusCodes.OK,
            body: {
              id: 354000,
              name: 'Test Name',
              acquisitionPercentage: 1,
              category: 1,
              description: 'Test Description',
              imageUrl: 'Test Url',
              levelId: 1,
              levelName: 'Test Name',
              parentId: null,
              typeId: 1
            }
          })
        }
      })
    );

    const achievement = await client.achievement.fetch(354000, 1);
    Common.isNotNullOrUndefined(achievement);
    Common.isMatch(
      achievement,
      {
        id: Number,
        name: String,
        description: String,
        typeId: Number,
        category: Number,
        imageUrl: String,
        levelId: Number,
        levelName: String,
        acquisitionPercentage: Number,
        parentId: [String, null] // multiple allowed types
      }
    );
    Common.callCount(spy, 1);
    Common.calledWith('achievement', { body: { idList: [354000], languageId: 1 } });

    spy.restore();
  });

  it('should return Achivement if an achievement exists - From cache', async function () {
    const spy = Common.createMockRequest(
      'achievement',
      new WOLFResponse({
        code: StatusCodes.MULTI_STATUS,
        body: {
          0: new WOLFResponse({
            code: StatusCodes.OK,
            body: {
              id: 354000,
              name: 'Test Name',
              acquisitionPercentage: 1,
              category: 1,
              description: 'Test Description',
              imageUrl: 'Test Url',
              levelId: 1,
              levelName: 'Test Name',
              parentId: null,
              typeId: 1
            }
          })
        }
      })
    );

    const achievementPrior = await client.achievement.fetch(354000, 1, { forceNew: true });
    Common.isNotNullOrUndefined(achievementPrior);
    Common.isMatch(
      achievementPrior,
      {
        id: Number,
        name: String,
        description: String,
        typeId: Number,
        category: Number,
        imageUrl: String,
        levelId: Number,
        levelName: String,
        acquisitionPercentage: Number,
        parentId: [String, null] // multiple allowed types
      }
    );

    const achievementAfter = await client.achievement.fetch(354000, 1);
    Common.isNotNullOrUndefined(achievementAfter);
    Common.isMatch(
      achievementAfter,
      {
        id: Number,
        name: String,
        description: String,
        typeId: Number,
        category: Number,
        imageUrl: String,
        levelId: Number,
        levelName: String,
        acquisitionPercentage: Number,
        parentId: [String, null] // multiple allowed types
      }
    );

    Common.callCount(spy, 1);
    Common.calledWith('achievement', { body: { idList: [354000], languageId: 1 } });

    spy.restore();
  });
});
