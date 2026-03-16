
import Common from '../../../resources/testObjects/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';

/** @type {import('../../../../../frameworks/wolf.js/src/client/WOLF.js').default} */
let client;

xdescribe('Banned Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => client.banned.clear());

  describe('list', () => {
    it('should return an empty INT[] if no banned users exist', () => {
      const bannedList = client.banned.list();
      Common.isNotNullOrUndefined(bannedList);
      Common.length(bannedList, 0);
    });

    it('should return an INT[] if banned users exist', async () => {
      await client.banned.ban([1, 2, 3]);

      const bannedList = client.banned.list();
      Common.isNotNullOrUndefined(bannedList);
      Common.length(bannedList, 3);
      Common.isMatch(bannedList, [1, 2, 3]);
    });
  });

  describe('ban', () => {
    it('should ban', async () => {
      const bannedListPrior = client.banned.list();
      Common.isNotNullOrUndefined(bannedListPrior);
      Common.length(bannedListPrior, 0);

      const bannedResult = await client.banned.ban(1);
      Common.isNotNullOrUndefined(bannedResult);
      Common.isMatch(bannedResult, 1);

      const bannedListAfter = client.banned.list();
      Common.isNotNullOrUndefined(bannedListAfter);
      Common.length(bannedListAfter, 1);
      Common.isMatch(bannedListAfter, [1]);
    });
  });

  describe('unban', () => {
    it('should return false if user is banned', async () => {
      const bannedListPrior = client.banned.list();
      Common.isNotNullOrUndefined(bannedListPrior);
      Common.length(bannedListPrior, 0);

      const bannedResult = await client.banned.unban(1);
      Common.isNotNullOrUndefined(bannedResult);
      Common.isMatch(bannedResult, 0);

      const bannedListAfter = client.banned.list();
      Common.isNotNullOrUndefined(bannedListAfter);
      Common.length(bannedListAfter, 0);
    });

    it('should return true if the user is ban', async () => {
      await client.banned.ban(1);

      const bannedListPrior = client.banned.list();
      Common.isNotNullOrUndefined(bannedListPrior);
      Common.length(bannedListPrior, 1);
      Common.isMatch(bannedListPrior, [1]);

      const bannedResult = await client.banned.unban(1);
      Common.isNotNullOrUndefined(bannedResult);
      Common.isMatch(bannedResult, 1);

      const bannedListAfter = client.banned.list();
      Common.isNotNullOrUndefined(bannedListAfter);
      Common.length(bannedListAfter, 0);
    });
  });

  describe('clear', () => {
    it('should clear the banned list', async () => {
      await client.banned.ban(1);

      const bannedListPrior = client.banned.list();
      Common.isNotNullOrUndefined(bannedListPrior);
      Common.length(bannedListPrior, 1);
      Common.isMatch(bannedListPrior, [1]);

      client.banned.clear();

      const bannedListAfter = client.banned.list();
      Common.isNotNullOrUndefined(bannedListAfter);
      Common.length(bannedListAfter, 0);
    });
  });
});
