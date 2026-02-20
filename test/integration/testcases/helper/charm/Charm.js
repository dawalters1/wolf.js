
import Common from '../../../resources/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';
import sinon from 'sinon';
import { StatusCodes } from 'http-status-codes';
import WOLFResponse from '../../../../../src/entities/WOLFResponse.js';

let client;

describe('Charm Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => {
    Common.restoreSocket();
    sinon.restore();
  });

  describe('fetch', () => {
    it('should return null when the ID doesn\'t exist', async () => {
      const spy = Common.createMockSocketRequest(
        'charm list',
        {
          body: {
            idList: [2],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: {
            2: new WOLFResponse(
              {
                code: StatusCodes.NOT_FOUND
              }
            )
          }
        })
      );

      const charm = await client.charm.fetch(2, 1, { forceNew: true });
      Common.isNull(charm);
      Common.callCount(spy, 1);
      Common.calledWith('charm list', { body: { idList: [2], languageId: 1 } });
    });

    it('should return a Charm when only a single ID is provided', async () => {
      const spy = Common.createMockSocketRequest(
        'charm list',
        {
          body: {
            idList: [2],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: {
            2: new WOLFResponse(
              {
                code: StatusCodes.OK,
                body: {
                  id: 2,
                  languageId: 1,
                  cost: 0,
                  description: 'Test Description',
                  imageUrl: 'Test URL',
                  name: 'Test Name',
                  productId: 123
                }
              }
            )
          }
        })
      );

      const charm = await client.charm.fetch(2, 1, { forceNew: true });
      Common.isNotNullOrUndefined(charm);
      Common.isMatch(
        charm,
        {
          id: Number,
          languageId: Number,
          cost: Number,
          description: String,
          imageUrl: String,
          name: String,
          productId: Number
        }
      );
      Common.callCount(spy, 1);
      Common.calledWith('charm list', { body: { idList: [2], languageId: 1 } });
    });

    it('should return a Charm[] when multiple IDs are provided', async () => {
      const spy = Common.createMockSocketRequest(
        'charm list',
        {
          body: {
            idList: [2, 3],
            languageId: 1
          }
        },
        new WOLFResponse({
          code: StatusCodes.MULTI_STATUS,
          body: {
            2: new WOLFResponse(
              {
                code: StatusCodes.OK,
                body: {
                  id: 2,
                  languageId: 1,
                  cost: 0,
                  description: 'Test Description',
                  imageUrl: 'Test URL',
                  name: 'Test Name',
                  productId: 123
                }
              }
            ),
            3: new WOLFResponse(
              {
                code: StatusCodes.NOT_FOUND
              }
            )
          }
        })
      );

      const charms = await client.charm.fetch([2, 3], 1, { forceNew: true });

      Common.isNotNullOrUndefined(charms);
      Common.length(charms, 2);
      Common.isMatch(
        charms[0],
        {
          id: Number,
          languageId: Number,
          cost: Number,
          description: String,
          imageUrl: String,
          name: String,
          productId: Number
        }
      );
      Common.isNull(charms[1]);
      Common.callCount(spy, 1);
      Common.calledWith('charm list', { body: { idList: [2, 3], languageId: 1 } });
    });
  });
});
