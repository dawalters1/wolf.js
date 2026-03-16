
import ChannelTest from '../../../resources/testObjects/Channel.js';
import Common from '../../../resources/testObjects/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';
import sinon from 'sinon';

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
    it('should return null if no channel exists', async () => await ChannelTest.test(client, 3));

    it('should return a Channel if it exists', async () => await ChannelTest.test(client, 1));

    it('should return a Channel[] if it exists', async () => await ChannelTest.test(client, [1, 2]));

    it('should return a Channel|null[]', async () => await ChannelTest.test(client, [1, 2, 3]));
  });
});
