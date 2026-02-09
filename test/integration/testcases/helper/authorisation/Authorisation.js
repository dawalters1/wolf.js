
import Common from '../../../resources/Common.js';
import initialiseClient from '../../../utility/initialiseClient.js';

/** @type {import('../../../../../frameworks/wolf.js/src/client/WOLF.js').default} */
let client;

describe('Authorisation Helper', function () {
  before(async function () {
    client = await initialiseClient();
  });

  afterEach(() => client.authorisation.clear());

  describe('list', () => {
    it('should return an empty INT[] if no authorised users exist', () => {
      const authorisedList = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedList);
      Common.length(authorisedList, 0);
    });

    it('should return an INT[] if authorised users exist', async () => {
      await client.authorisation.authorise([1, 2, 3]);

      const authorisedList = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedList);
      Common.length(authorisedList, 3);
      Common.isMatch(authorisedList, [1, 2, 3]);
    });
  });

  describe('authorise', () => {
    it('should authorise', async () => {
      const authorisedListPrior = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListPrior);
      Common.length(authorisedListPrior, 0);

      const authorisationResult = await client.authorisation.authorise(1);
      Common.isNotNullOrUndefined(authorisationResult);
      Common.isMatch(authorisationResult, 1);

      const authorisedListAfter = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListAfter);
      Common.length(authorisedListAfter, 1);
      Common.isMatch(authorisedListAfter, [1]);
    });
  });

  describe('deauthorise', () => {
    it('should return false if user is authorised', async () => {
      const authorisedListPrior = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListPrior);
      Common.length(authorisedListPrior, 0);

      const authorisationResult = await client.authorisation.deauthorise(1);
      Common.isNotNullOrUndefined(authorisationResult);
      Common.isMatch(authorisationResult, 0);

      const authorisedListAfter = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListAfter);
      Common.length(authorisedListAfter, 0);
    });

    it('should return true if the user is authorise', async () => {
      await client.authorisation.authorise(1);

      const authorisedListPrior = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListPrior);
      Common.length(authorisedListPrior, 1);
      Common.isMatch(authorisedListPrior, [1]);

      const authorisationResult = await client.authorisation.deauthorise(1);
      Common.isNotNullOrUndefined(authorisationResult);
      Common.isMatch(authorisationResult, 1);

      const authorisedListAfter = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListAfter);
      Common.length(authorisedListAfter, 0);
    });
  });

  describe('clear', () => {
    it('should clear the authorisation list', async () => {
      await client.authorisation.authorise(1);

      const authorisedListPrior = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListPrior);
      Common.length(authorisedListPrior, 1);
      Common.isMatch(authorisedListPrior, [1]);

      client.authorisation.clear();

      const authorisedListAfter = client.authorisation.list();
      Common.isNotNullOrUndefined(authorisedListAfter);
      Common.length(authorisedListAfter, 0);
    });
  });
});
