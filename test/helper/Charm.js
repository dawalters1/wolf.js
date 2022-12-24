import { WOLF, CharmSelectedBuilder } from '../../index.js';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';

describe('Charm', () => {
  const client = new WOLF();

  before(() => {
    const mochaConfig = client._frameworkConfig.get('connection.mocha');

    return new Promise((resolve, reject) => {
      client.on('ready', () => resolve());
      client.on('loginFailed', (reason) => reject(reason));

      client.login(mochaConfig.email, mochaConfig.password);
    });
  });

  after(() => client.logout(true));

  describe('Charm Helper', () => {
    describe('list', () => {
      it('should should return a list of charms', async () => {
        const charms = await client.charm.list();

        expect(charms).to.not.equal(undefined);
        expect(charms).to.not.equal(null);
        expect(charms.length).to.not.equal(0);
      });
    });

    describe('getById', () => {
      it('should return a charm model if it does not exist', async () => {
        const charm = await client.charm.getById(15445345);

        expect(charm).to.not.equal(undefined);
        expect(charm).to.not.equal(null);
        expect(charm.exists).to.equal(false);
      });

      it('should return a charm model if it exist', async () => {
        const charm = await client.charm.getById(1);

        expect(charm).to.not.equal(undefined);
        expect(charm).to.not.equal(null);
        expect(charm.id).to.equal(1);
        expect(charm.name).to.equal('heart');
        expect(charm.productId).to.equal(5000);
        expect(charm.imageUrl).to.equal('https://s3.amazonaws.com/media.parlingo.com/charm/romance/heart.png');
        expect(charm.descriptionPhraseId).to.equal(null);
        expect(charm.descriptionList.length).to.equal(0);
        expect(charm.nameTranslationList).to.not.equal(undefined);
        expect(charm.nameTranslationList.length).to.not.equal(0);

        for (const nameTranslation of charm.nameTranslationList) {
          expect(nameTranslation.languageId).to.greaterThan(0);
          expect(nameTranslation.text).to.not.equal(undefined);
          expect(nameTranslation.text).to.not.equal(null);
        }

        expect(charm.weight).to.equal(5000);
        expect(charm.cost).to.equal(25);
        expect(charm.exists).to.equal(true);
      });
    });

    describe('getByIds', () => {
      it('should return an array of charms regardless if they exist', async () => {
        const charms = await client.charm.getByIds([1, 15445345]);

        expect(charms).to.not.equal(undefined);
        expect(charms).to.not.equal(null);
        expect(charms.length).to.equal(2);

        const existent = charms.find((charm) => charm.id === 1);

        expect(existent).to.not.equal(undefined);
        expect(existent).to.not.equal(null);
        expect(existent.id).to.equal(1);
        expect(existent.name).to.equal('heart');
        expect(existent.productId).to.equal(5000);
        expect(existent.imageUrl).to.equal('https://s3.amazonaws.com/media.parlingo.com/charm/romance/heart.png');
        expect(existent.descriptionPhraseId).to.equal(null);
        expect(existent.descriptionList.length).to.equal(0);
        expect(existent.nameTranslationList).to.not.equal(undefined);
        expect(existent.nameTranslationList.length).to.not.equal(0);

        for (const nameTranslation of existent.nameTranslationList) {
          expect(nameTranslation.languageId).to.greaterThan(0);
          expect(nameTranslation.text).to.not.equal(undefined);
          expect(nameTranslation.text).to.not.equal(null);
        }

        expect(existent.weight).to.equal(5000);
        expect(existent.cost).to.equal(25);
        expect(existent.exists).to.equal(true);

        const nonExistent = charms.find((charm) => charm.id === 15445345);

        expect(nonExistent).to.not.equal(undefined);
        expect(nonExistent).to.not.equal(null);
        expect(nonExistent.exists).to.equal(false);
      });
    });

    describe('getSubscriberSummary', () => {
      it('should should return an empty array if the subscriber doesnt exist', async () => {
        const summary = await client.charm.getSubscriberSummary(432421344);

        expect(summary).to.not.equal(undefined);
        expect(summary).to.not.equal(null);
        expect(summary.length).to.equal(0);
      });

      it('should should return an array if the subscriber exists', async () => {
        const summary = await client.charm.getSubscriberSummary(29976610);

        expect(summary).to.not.equal(undefined);
        expect(summary).to.not.equal(null);
        expect(summary.length).to.not.equal(0);

        for (const charmSummary of summary) {
          expect(charmSummary).to.not.equal(undefined);
          expect(charmSummary).to.not.equal(null);
          expect(charmSummary.charmId).to.greaterThan(0);
          expect(charmSummary.total).to.greaterThan(0);
          expect(charmSummary.expireTime).to.not.equal(undefined);
          expect(charmSummary.giftCount).to.greaterThanOrEqual(0);
        }
      });
    });

    describe('getSubscriberStatistics', () => {
      it('should return if a subscribers exist', async () => {
        const statistics = await client.charm.getSubscriberStatistics(832423421);

        expect(statistics).to.not.equal(undefined);
        expect(statistics).to.not.equal(null);
        expect(statistics.subscriberId).to.equal(832423421);
        expect(statistics.totalLifetime).to.equal(null);
        expect(statistics.totalGiftedSent).to.equal(null);
        expect(statistics.totalGiftedReceived).to.equal(null);
        expect(statistics.totalActive).to.equal(0);
        expect(statistics.totalExpired).to.equal(null);
      });

      it('should return if a subscribers exist', async () => {
        const statistics = await client.charm.getSubscriberStatistics(29976610);

        expect(statistics).to.not.equal(undefined);
        expect(statistics).to.not.equal(null);
        expect(statistics.subscriberId).to.equal(29976610);
        expect(statistics.totalLifetime).to.equal(196);
        expect(statistics.totalGiftedSent).to.equal(135);
        expect(statistics.totalGiftedReceived).to.equal(155);
        expect(statistics.totalActive).to.equal(123);
        expect(statistics.totalExpired).to.greaterThan(0);
      });
    });

    describe('getSubscriberActiveList', () => {
      it('should return an empty array if a subscriber doesnt exist', async () => {
        const active = await client.charm.getSubscriberActiveList(832423421);

        expect(active).to.not.equal(undefined);
        expect(active).to.not.equal(null);
        expect(active.length).to.equal(0);
      });

      it('should return an array if a subscriber exists', async () => {
        const active = await client.charm.getSubscriberActiveList(29976610);

        expect(active).to.not.equal(undefined);
        expect(active).to.not.equal(null);
        expect(active.length).to.greaterThan(0);

        const activeCharm = active[0];

        expect(activeCharm).to.not.equal(undefined);
        expect(activeCharm).to.not.equal(null);
        expect(activeCharm.id).to.greaterThan(0);
        expect(activeCharm.charmId).to.greaterThan(0);
        expect(activeCharm.subscriberId).to.greaterThan(0);
      });
    });

    describe('getSubscriberExpiredList', () => {
      it('should return an empty array if a subscriber doesnt exist', async () => {
        const expired = await client.charm.getSubscriberExpiredList(832423421);

        expect(expired).to.not.equal(undefined);
        expect(expired).to.not.equal(null);
        expect(expired.length).to.equal(0);
      });

      it('should return an array if a subscriber exists', async () => {
        const expired = await client.charm.getSubscriberExpiredList(29976610);

        expect(expired).to.not.equal(undefined);
        expect(expired).to.not.equal(null);
        expect(expired.length).to.greaterThan(0);

        const expiredCharm = expired[0];

        expect(expiredCharm).to.not.equal(undefined);
        expect(expiredCharm).to.not.equal(null);
        expect(expiredCharm.id).to.greaterThan(0);
        expect(expiredCharm.charmId).to.greaterThan(0);
        expect(expiredCharm.subscriberId).to.greaterThan(0);
      });
    });

    describe('delete', () => {
      it('should delete a charm', async () => {
        const expired = await client.charm.getSubscriberExpiredList(29976610);

        expect(expired).to.not.equal(undefined);
        expect(expired).to.not.equal(null);
        expect(expired.length).to.greaterThan(0);

        const charmToDelete = expired[0];

        const response = await client.charm.delete(charmToDelete.id);

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response.success).to.equal(true);
      });
    });

    describe('set', () => {
      it('should set a charm', async () => {
        const active = await client.charm.getSubscriberActiveList(29976610);

        expect(active).to.not.equal(undefined);
        expect(active).to.not.equal(null);
        expect(active.length).to.greaterThan(0);

        const charmToSet = active[0];

        const response = await client.charm.set(new CharmSelectedBuilder(charmToSet.charmId, 0));

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response.success).to.equal(true);
      });
    });
  });
});
