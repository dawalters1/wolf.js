
import Common from '../../../resources/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';
import sinon from 'sinon';
import { StatusCodes } from 'http-status-codes';
import WOLFResponse from '../../../../../src/entities/WOLFResponse.js';

let client;

describe('Channel Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => {
    Common.restoreSocket();
    sinon.restore();
  });

  describe('fetch', () => {

  });
});
