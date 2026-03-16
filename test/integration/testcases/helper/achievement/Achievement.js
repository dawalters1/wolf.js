
import Common from '../../../resources/testObjects/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';
import sinon from 'sinon';
import { StatusCodes } from 'http-status-codes';
import WOLFResponse from '../../../../../src/entities/WOLFResponse.js';

let client;

xdescribe('Achievement Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => {
    Common.restoreSocket();
    sinon.restore();
  });

  describe('fetch', () => {
    it("should return null if an achievement doesn't exist", async function () {
      const spy = Common.createMockSocketRequest(
        'achievement',
        {
          body: {
            idList: [2],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: { 0: new WOLFResponse({ code: StatusCodes.NOT_FOUND }) }
        })
      );

      const achievement = await client.achievement.fetch(2, 1);
      Common.isNull(achievement);
      Common.callCount(spy, 1);
      Common.calledWith('achievement', { body: { idList: [2], languageId: 1 } });
    });

    it('should return Achivement if an achievement exists - From the server', async function () {
      const spy = Common.createMockSocketRequest(
        'achievement',
        {
          body: {
            idList: [2],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: {
            0: new WOLFResponse({
              code: StatusCodes.OK,
              body: {
                id: 2,
                name: 'Test Name',
                acquisitionPercentage: 1,
                category: 1,
                description: 'Test Description',
                imageUrl: 'Test Url',
                levelId: 1,
                levelName: 'Test Name',
                parentId: null,
                typeId: 1,
                languageId: 1
              }
            })
          }
        })
      );

      const achievement = await client.achievement.fetch(2, 1);
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
          parentId: [String, null], // multiple allowed types
          languageId: Number
        }
      );
      Common.callCount(spy, 1);
      Common.calledWith('achievement', { body: { idList: [2], languageId: 1 } });
    });

    it('should return Achivement if an achievement exists - From cache', async function () {
      const spy = Common.createMockSocketRequest(
        'achievement',
        {
          body: {
            idList: [2],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: {
            0: new WOLFResponse({
              code: StatusCodes.OK,
              body: {
                id: 2,
                name: 'Test Name',
                acquisitionPercentage: 1,
                category: 1,
                description: 'Test Description',
                imageUrl: 'Test Url',
                levelId: 1,
                levelName: 'Test Name',
                parentId: null,
                typeId: 1,
                languageId: 1
              }
            })
          }
        })
      );

      const achievementPrior = await client.achievement.fetch(2, 1, { forceNew: true });
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
          parentId: [String, null], // multiple allowed types
          languageId: Number
        }
      );

      const achievementAfter = await client.achievement.fetch(2, 1);
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
          parentId: [String, null], // multiple allowed types
          languageId: Number
        }
      );

      Common.callCount(spy, 1);
      Common.calledWith('achievement', { body: { idList: [2], languageId: 1 } });
    });
  });
});
