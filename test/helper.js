/* eslint-disable no-unused-vars */
import { WOLF, MessageFilterTier, Language, CharmSelectedBuilder, Group, TipPeriod, TipDirection, TipType, Message, StoreProductPartial, Event, LogLevel, WOLFAPIError } from '../index.js';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';

const contactIds = [25129067, 29976610];
const blockedIds = [81175317, 26517517];

const groupId = 18448720;
const subscriberId = 80280172;
const timestamp = 1672331025173759;

describe('Helpers', () => {
  const client = new WOLF();

  let eventId;
  let message;

  before(() => {
    const mochaConfig = client._frameworkConfig.get('connection.mocha');

    return new Promise((resolve, reject) => {
      client.on('ready', () => resolve());
      client.on('loginFailed', (reason) => reject(reason));

      client.on('message', (msg) => {
        if (message.targetGroupId === groupId && message.sourceSubscriberId === client.currentSubscriber.id) {
          message = msg;

          console.log(message.toJSON());
        }
      });
      client.login(mochaConfig.email, mochaConfig.password);
    });
  });

  after(() => client.logout(true));
  /*
  describe('Achievement', () => {
    describe('Achievement Helper', () => {
      describe('getById', () => {
        it('should return an achievement model if it does not exist', async () => {
          const achievement = await client.achievement.getById(1, Language.ENGLISH);

          expect(achievement).to.not.equal(undefined);
          expect(achievement).to.not.equal(null);
          expect(achievement.id).to.equal(1);
          expect(achievement.exists).to.equal(false);

          expect(client.achievement.achievements).to.not.deep.includes(achievement);
        });

        it('should return an achievement model if it exists', async () => {
          const achievement = await client.achievement.getById(19968, Language.ENGLISH);

          expect(achievement).to.not.equal(undefined);
          expect(achievement).to.not.equal(null);
          expect(achievement.id).to.equal(19968);
          expect(achievement.parentId).to.equal(null);
          expect(achievement.typeId).to.equal(2);
          expect(achievement.name).to.equal('Gold Star Performer');
          expect(achievement.description).to.equal("Awarded for taking 1st place in one of our talent shows. You're someone who really has that X-Factor! Well done!");
          expect(achievement.imageUrl).to.equal('https://s3.amazonaws.com/media.parlingo.com/website/live/palringo/images/_achievements/star_performer_gold.png');
          expect(achievement.category).to.equal(5);
          expect(achievement.levelId).to.equal(1);
          expect(achievement.levelName).to.equal('Level 1');
          expect(achievement.acquisitionPercentage).to.equal(1);

          expect(achievement.exists).to.equal(true);

          expect(client.achievement.achievements[Language.ENGLISH]).to.deep.includes(achievement);
        });
      });

      describe('getByIds', () => {
        it('should return an array of achievements regardless if they exist', async () => {
          const achievements = await client.achievement.getByIds([1, 19968], Language.ENGLISH);

          expect(achievements).to.not.equal(undefined);
          expect(achievements).to.not.equal(null);
          expect(achievements.length).to.equal(2);

          const nonExistent = achievements.find((achievement) => achievement.id === 1);

          expect(nonExistent).to.not.equal(undefined);
          expect(nonExistent).to.not.equal(null);
          expect(nonExistent.id).to.equal(1);
          expect(nonExistent.exists).to.equal(false);

          expect(client.achievement.achievements).to.not.deep.includes(nonExistent);

          const existent = achievements.find((achievement) => achievement.id === 19968);

          expect(existent).to.not.equal(undefined);
          expect(existent).to.not.equal(null);
          expect(existent.id).to.equal(19968);
          expect(existent.parentId).to.equal(null);
          expect(existent.typeId).to.equal(2);
          expect(existent.name).to.equal('Gold Star Performer');
          expect(existent.description).to.equal("Awarded for taking 1st place in one of our talent shows. You're someone who really has that X-Factor! Well done!");
          expect(existent.imageUrl).to.equal('https://s3.amazonaws.com/media.parlingo.com/website/live/palringo/images/_achievements/star_performer_gold.png');
          expect(existent.category).to.equal(5);
          expect(existent.levelId).to.equal(1);
          expect(existent.levelName).to.equal('Level 1');
          expect(existent.acquisitionPercentage).to.equal(1);

          expect(existent.exists).to.equal(true);

          expect(client.achievement.achievements[Language.ENGLISH]).to.deep.includes(existent);
        });
      });
    });

    describe('Category Helper', () => {
      it('should return a list of categories', async () => {
        const categories = await client.achievement.category.getList(Language.ENGLISH);

        expect(categories).to.not.equal(undefined);
        expect(categories).to.not.equal(null);
        expect(categories.length).to.not.equal(0);

        for (const category of categories) {
          expect(category).to.not.equal(undefined);
          expect(category).to.not.equal(null);
          expect(category.id).to.not.equal(undefined);
          expect(category.id).to.not.equal(null);
          expect(category.name).to.not.equal(undefined);
          expect(category.name).to.not.equal(null);
        }
      });
    });

    describe('Group Helper', () => {
      it('should return an array of unlocked achievements regardless if the group exists', async () => {
        const unlockedList = await client.achievement.group.getById(18448720);

        expect(unlockedList).to.not.equal(undefined);
        expect(unlockedList).to.not.equal(null);
        expect(unlockedList.length).to.not.equal(0);

        for (const unlocked of unlockedList) {
          expect(unlocked).to.not.equal(undefined);
          expect(unlocked).to.not.equal(null);
          expect(unlocked.id).to.not.equal(undefined);
          expect(unlocked.id).to.not.equal(null);
          expect(unlocked.additionalInfo).to.not.equal(undefined);
          expect(unlocked.additionalInfo).to.not.equal(null);
          expect(unlocked.additionalInfo.eTag).to.not.equal(undefined);
          expect(unlocked.additionalInfo.eTag).to.not.equal(null);
          expect(unlocked.additionalInfo.awardedAt).to.not.equal(undefined);
          expect(unlocked.additionalInfo.categoryId).to.not.equal(undefined);
          expect(unlocked.additionalInfo.categoryId).to.not.equal(null);
          expect(unlocked.additionalInfo.total).to.not.equal(undefined);
          expect(unlocked.additionalInfo.total).to.not.equal(null);
          expect(unlocked.additionalInfo.total).to.be.greaterThanOrEqual(0);
          expect(unlocked.additionalInfo.steps).to.not.equal(undefined);
          expect(unlocked.additionalInfo.steps).to.not.equal(null);
          expect(unlocked.additionalInfo.steps).to.be.greaterThanOrEqual(0);
        }
      });
    });

    describe('Subscriber Helper', () => {
      it('should return an array of unlocked achievements regardless if the subscriber exists', async () => {
        const unlockedList = await client.achievement.subscriber.getById(80280172);

        expect(unlockedList).to.not.equal(undefined);
        expect(unlockedList).to.not.equal(null);
        expect(unlockedList.length).to.not.equal(0);

        for (const unlocked of unlockedList) {
          expect(unlocked).to.not.equal(undefined);
          expect(unlocked).to.not.equal(null);
          expect(unlocked.id).to.not.equal(undefined);
          expect(unlocked.id).to.not.equal(null);
          expect(unlocked.additionalInfo).to.not.equal(undefined);
          expect(unlocked.additionalInfo).to.not.equal(null);
          expect(unlocked.additionalInfo.eTag).to.not.equal(undefined);
          expect(unlocked.additionalInfo.eTag).to.not.equal(null);
          expect(unlocked.additionalInfo.awardedAt).to.not.equal(undefined);
          expect(unlocked.additionalInfo.categoryId).to.not.equal(undefined);
          expect(unlocked.additionalInfo.categoryId).to.not.equal(null);
          expect(unlocked.additionalInfo.total).to.not.equal(undefined);
          expect(unlocked.additionalInfo.total).to.not.equal(null);
          expect(unlocked.additionalInfo.total).to.be.greaterThanOrEqual(0);
          expect(unlocked.additionalInfo.steps).to.not.equal(undefined);
          expect(unlocked.additionalInfo.steps).to.not.equal(null);
          expect(unlocked.additionalInfo.steps).to.be.greaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Authorization', () => {
    describe('Authorization Helper', () => {
      describe('list', () => {
        it('should return an empty array if no ids exist', async () => {
          const authorized = await client.authorization.list();

          expect(authorized).to.not.equal(undefined);
          expect(authorized).to.not.equal(null);
          expect(authorized.length).to.equal(0);
        });

        it('should return an array if ids exist', async () => {
          await client.authorization.authorize([1, 2, 3, 4, 5]);

          const authorized = await client.authorization.list();

          expect(authorized).to.not.equal(undefined);
          expect(authorized).to.not.equal(null);
          expect(authorized.length).to.equal(5);
        });
      });

      describe('clear', () => {
        it('should clear the authorization list', async () => {
          await client.authorization.authorize([1, 2, 3, 4, 5]);

          const authorizedBefore = await client.authorization.list();

          expect(authorizedBefore).to.not.equal(undefined);
          expect(authorizedBefore).to.not.equal(null);
          expect(authorizedBefore.length).to.equal(5);

          await client.authorization.clear();

          const authorizedAfter = await client.authorization.list();

          expect(authorizedAfter).to.not.equal(undefined);
          expect(authorizedAfter).to.not.equal(null);
          expect(authorizedAfter.length).to.equal(0);
        });
      });

      describe('isAuthorized', () => {
        it('should return true if a subscriber is authorized', async () => {
          await client.authorization.authorize([1]);

          const isAuthorized = await client.authorization.isAuthorized(1);

          expect(isAuthorized).to.not.equal(undefined);
          expect(isAuthorized).to.not.equal(null);
          expect(isAuthorized).to.equal(true);
        });

        it('should return false if a subscriber is not authorized', async () => {
          await client.authorization.authorize([1]);

          const isAuthorized = await client.authorization.isAuthorized(2);

          expect(isAuthorized).to.not.equal(undefined);
          expect(isAuthorized).to.not.equal(null);
          expect(isAuthorized).to.equal(false);
        });
      });

      describe('authorize', () => {
        it('should return true if a user is added to the authorization list', async () => {
          const authorizationResult = await client.authorization.authorize(1);

          expect(authorizationResult).to.not.equal(undefined);
          expect(authorizationResult).to.not.equal(null);
          expect(authorizationResult).to.equal(true);
        });

        it('should return false if a user is not added to the authorization list', async () => {
          const authorizationResultBefore = await client.authorization.authorize(1);

          expect(authorizationResultBefore).to.not.equal(undefined);
          expect(authorizationResultBefore).to.not.equal(null);
          expect(authorizationResultBefore).to.equal(true);

          const authorizationResultAfter = await client.authorization.authorize(1);

          expect(authorizationResultAfter).to.not.equal(undefined);
          expect(authorizationResultAfter).to.not.equal(null);
          expect(authorizationResultAfter).to.equal(false);
        });
      });

      describe('unauthorize', () => {
        it('should return false if a user is not removed from the authorization list', async () => {
          const authorizationResult = await client.authorization.unauthorize(1);

          expect(authorizationResult).to.not.equal(undefined);
          expect(authorizationResult).to.not.equal(null);
          expect(authorizationResult).to.equal(false);
        });

        it('should return true if a user is removed from the authorization list', async () => {
          const authorizationResultBefore = await client.authorization.authorize(1);

          expect(authorizationResultBefore).to.not.equal(undefined);
          expect(authorizationResultBefore).to.not.equal(null);
          expect(authorizationResultBefore).to.equal(true);

          const authorizationResultAfter = await client.authorization.unauthorize(1);

          expect(authorizationResultAfter).to.not.equal(undefined);
          expect(authorizationResultAfter).to.not.equal(null);
          expect(authorizationResultAfter).to.equal(true);
        });
      });
    });
  });

  describe('Banned', () => {
    describe('Banned Helper', () => {
      describe('list', () => {
        it('should return an empty array if no ids exist', async () => {
          const banned = await client.banned.list();

          expect(banned).to.not.equal(undefined);
          expect(banned).to.not.equal(null);
          expect(banned.length).to.equal(0);
        });

        it('should return an array if ids exist', async () => {
          await client.banned.ban([1, 2, 3, 4, 5]);

          const banned = await client.banned.list();

          expect(banned).to.not.equal(undefined);
          expect(banned).to.not.equal(null);
          expect(banned.length).to.equal(5);
        });
      });

      describe('clear', () => {
        it('should clear the banned list', async () => {
          await client.banned.ban([1, 2, 3, 4, 5]);

          const bannedBefore = await client.banned.list();

          expect(bannedBefore).to.not.equal(undefined);
          expect(bannedBefore).to.not.equal(null);
          expect(bannedBefore.length).to.equal(5);

          await client.banned.clear();

          const bannedAfter = await client.banned.list();

          expect(bannedAfter).to.not.equal(undefined);
          expect(bannedAfter).to.not.equal(null);
          expect(bannedAfter.length).to.equal(0);
        });
      });

      describe('isBanned', () => {
        it('should return true if a subscriber is banned', async () => {
          await client.banned.ban([1]);

          const isBanned = await client.banned.isBanned(1);

          expect(isBanned).to.not.equal(undefined);
          expect(isBanned).to.not.equal(null);
          expect(isBanned).to.equal(true);
        });

        it('should return false if a subscriber is not banned', async () => {
          await client.banned.ban([1]);

          const isBanned = await client.banned.isBanned(2);

          expect(isBanned).to.not.equal(undefined);
          expect(isBanned).to.not.equal(null);
          expect(isBanned).to.equal(false);
        });
      });

      describe('ban', () => {
        it('should return true if a user is added to the banned list', async () => {
          const bannedResult = await client.banned.ban(1);

          expect(bannedResult).to.not.equal(undefined);
          expect(bannedResult).to.not.equal(null);
          expect(bannedResult).to.equal(true);
        });

        it('should return false if a user is not added to the banned list', async () => {
          const bannedResultBefore = await client.banned.ban(1);

          expect(bannedResultBefore).to.not.equal(undefined);
          expect(bannedResultBefore).to.not.equal(null);
          expect(bannedResultBefore).to.equal(true);

          const bannedResultAfter = await client.banned.ban(1);

          expect(bannedResultAfter).to.not.equal(undefined);
          expect(bannedResultAfter).to.not.equal(null);
          expect(bannedResultAfter).to.equal(false);
        });
      });

      describe('unban', () => {
        it('should return false if a user is not removed from the banned list', async () => {
          const bannedResult = await client.banned.unban(1);

          expect(bannedResult).to.not.equal(undefined);
          expect(bannedResult).to.not.equal(null);
          expect(bannedResult).to.equal(false);
        });

        it('should return true if a user is removed from the banned list', async () => {
          const bannedResultBefore = await client.banned.ban(1);

          expect(bannedResultBefore).to.not.equal(undefined);
          expect(bannedResultBefore).to.not.equal(null);
          expect(bannedResultBefore).to.equal(true);

          const bannedResultAfter = await client.banned.unban(1);

          expect(bannedResultAfter).to.not.equal(undefined);
          expect(bannedResultAfter).to.not.equal(null);
          expect(bannedResultAfter).to.equal(true);
        });
      });
    });
  });

  describe('Charm', () => {
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

  describe('Contact', () => {
    describe('Contact Helper', () => {
      describe('add', () => {
        it('should add to blocked list', async () => {
          const response = await client.contact.add(contactIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('isContact', () => {
        it('it should return false if id is not a contact', async () => {
          const response = await client.contact.isContact(contactIds[1]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response).to.equal(false);
        });

        it('it should return true if id is a contact', async () => {
          const response = await client.contact.isContact(contactIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response).to.equal(true);
        });
      });

      describe('unblock', () => {
        it('should unblock a contact', async () => {
          const response = await client.contact.delete(contactIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('list', () => {
        it('it should return an empty array if no contacts exist', async () => {
          const blocked = await client.contact.list();

          expect(blocked).to.not.equal(undefined);
          expect(blocked).to.not.equal(null);
          expect(blocked.length).to.equal(0);
        });

        it('it should return an array if contacts exists', async () => {
          await client.contact.block(contactIds[0]);

          const blocked = await client.contact.list();

          expect(blocked).to.not.equal(undefined);
          expect(blocked).to.not.equal(null);
          expect(blocked.length).to.greaterThan(0);

          for (const contact of blocked) {
            expect(contact).to.not.equal(undefined);
            expect(contact).to.not.equal(null);
            expect(contact.id).to.equal(contactIds[0]);
            expect(contact.additionalInfo).to.not.equal(undefined);
            expect(contact.additionalInfo).to.not.equal(null);
            expect(contact.additionalInfo.hash).to.not.equal(undefined);
            expect(contact.additionalInfo.hash).to.not.equal(null);
            expect(contact.additionalInfo.nicknameShort).to.not.equal(undefined);
            expect(contact.additionalInfo.nicknameShort).to.not.equal(null);
            expect(contact.additionalInfo.onlineState).to.greaterThanOrEqual(0);
            expect(contact.additionalInfo.privileges).to.greaterThanOrEqual(0);
          }
        });
      });
    });

    describe('Blocked Helper', () => {
      describe('add', () => {
        it('should add to blocked list', async () => {
          const response = await client.contact.blocked.block(blockedIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('isBlocked', () => {
        it('it should return false if id is not blocked', async () => {
          const response = await client.contact.blocked.isBlocked(blockedIds[1]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response).to.equal(false);
        });

        it('it should return true if id is not blocked', async () => {
          const response = await client.contact.blocked.isBlocked(blockedIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response).to.equal(true);
        });
      });

      describe('unblock', () => {
        it('should unblock a contact', async () => {
          const response = await client.contact.blocked.unblock(blockedIds[0]);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('list', () => {
        it('it should return an empty array if no blocked contacts exist', async () => {
          const blocked = await client.contact.blocked.list();

          expect(blocked).to.not.equal(undefined);
          expect(blocked).to.not.equal(null);
          expect(blocked.length).to.equal(0);
        });

        it('it should return an array if blocked contacts exists', async () => {
          await client.contact.blocked.block(blockedIds[0]);

          const blocked = await client.contact.blocked.list();

          expect(blocked).to.not.equal(undefined);
          expect(blocked).to.not.equal(null);
          expect(blocked.length).to.greaterThan(0);

          for (const contact of blocked) {
            expect(contact).to.not.equal(undefined);
            expect(contact).to.not.equal(null);
            expect(contact.id).to.equal(blockedIds[0]);
            expect(contact.additionalInfo).to.not.equal(undefined);
            expect(contact.additionalInfo).to.not.equal(null);
            expect(contact.additionalInfo.hash).to.not.equal(undefined);
            expect(contact.additionalInfo.hash).to.not.equal(null);
            expect(contact.additionalInfo.nicknameShort).to.not.equal(undefined);
            expect(contact.additionalInfo.nicknameShort).to.not.equal(null);
            expect(contact.additionalInfo.onlineState).to.greaterThanOrEqual(0);
            expect(contact.additionalInfo.privileges).to.greaterThanOrEqual(0);
          }
        });
      });
    });
  });

  describe('Discovery', () => {
    describe('Discovery Helper', () => {
      describe('get', () => {
        it('it should return the discovery page and all its sections', async () => {
          const store = await client.discovery.get(Language.ENGLISH);

          expect(store).to.not.equal(undefined);
          expect(store).to.not.equal(null);
          expect(store.id).to.greaterThan(0);
          expect(store.title).to.not.equal(undefined);
          expect(store.title).to.not.equal(null);
          expect(store.languageId).to.greaterThan(0);
          expect(store.sections.length).to.greaterThan(0);

          const groupSection = await store.sections.filter((section) => section.recipe?.type === 'group')[0].get();

          expect(groupSection).to.not.equal(undefined);
          expect(groupSection).to.not.equal(null);
          expect(groupSection.length).to.greaterThan(0);
          expect(groupSection[0]).to.be.an.instanceOf(Group);

          const storeSection = await store.sections.filter((section) => section.recipe?.type === 'product')[1].get();

          expect(storeSection).to.not.equal(undefined);
          expect(storeSection).to.not.equal(null);
          expect(storeSection.length).to.greaterThan(0);
          expect(storeSection[0]).to.be.an.instanceOf(StoreProductPartial);

          const eventSection = await store.sections.find((section) => section.recipe?.type === 'event').get();

          expect(eventSection).to.not.equal(undefined);
          expect(eventSection).to.not.equal(null);
          expect(eventSection.length).to.greaterThan(0);
          expect(eventSection[0]).to.be.an.instanceOf(Event);
        });
      });
    });
  });

  describe('Event', () => {
    describe('Event Helper', () => {
      describe('getById', () => {
        it('should return an event model if it does not exist', async () => {
          const event = await client.event.getById(743438516, Language.ENGLISH);

          expect(event).to.not.equal(undefined);
          expect(event).to.not.equal(null);
          expect(event.id).to.equal(743438516);
          expect(event.exists).to.equal(false);

          expect(client.event.events).to.not.deep.includes(event);
        });

        it('should return an event model if it exists', async () => {
          const event = await client.event.getById(78516, Language.ENGLISH);

          expect(event).to.not.equal(undefined);
          expect(event).to.not.equal(null);
          expect(event.id).to.equal(78516);
          expect(event.title).to.equal('Live Comedy - Ann Van Epps');
          expect(event.category).to.equal(null);
          expect(event.shortDescription).to.equal('Holiday Comedy Celebration ');
          expect(event.longDescription).to.not.equal(undefined);
          expect(event.longDescription).to.not.equal(null);
          expect(event.imageUrl).to.equal('https://df49rkfq0koe8.cloudfront.net/event/78516/da52a55f95c54dbeac21573b1fc38462_original.jpeg');
          expect(event.startsAt).to.not.equal(undefined);
          expect(event.startsAt).to.not.equal(null);
          expect(event.endsAt).to.not.equal(undefined);
          expect(event.endsAt).to.not.equal(null);
          expect(event.endsAt).to.not.equal(event.startsAt);
          expect(event.isRemoved).to.equal(false);
          expect(event.attendanceCount).to.greaterThan(0);
          expect(event.exists).to.equal(true);
        });
      });

      describe('getByIds', () => {
        it('should return an array of events regardless if they exist', async () => {
          const events = await client.event.getByIds([743438516, 78516], Language.ENGLISH);

          expect(events).to.not.equal(undefined);
          expect(events).to.not.equal(null);
          expect(events.length).to.equal(2);

          const nonExistent = events.find((event) => event.id === 743438516);

          expect(nonExistent).to.not.equal(undefined);
          expect(nonExistent).to.not.equal(null);
          expect(nonExistent.id).to.equal(743438516);
          expect(nonExistent.exists).to.equal(false);

          expect(client.event.events).to.not.deep.includes(nonExistent);

          const existent = events.find((event) => event.id === 78516);

          expect(existent).to.not.equal(undefined);
          expect(existent).to.not.equal(null);
          expect(existent.id).to.equal(78516);
          expect(existent.title).to.equal('Live Comedy - Ann Van Epps');
          expect(existent.category).to.equal(null);
          expect(existent.shortDescription).to.equal('Holiday Comedy Celebration ');
          expect(existent.longDescription).to.not.equal(undefined);
          expect(existent.longDescription).to.not.equal(null);
          expect(existent.imageUrl).to.equal('https://df49rkfq0koe8.cloudfront.net/event/78516/da52a55f95c54dbeac21573b1fc38462_original.jpeg');
          expect(existent.startsAt).to.not.equal(undefined);
          expect(existent.startsAt).to.not.equal(null);
          expect(existent.endsAt).to.not.equal(undefined);
          expect(existent.endsAt).to.not.equal(null);
          expect(existent.endsAt).to.not.equal(existent.startsAt);
          expect(existent.isRemoved).to.equal(false);
          expect(existent.attendanceCount).to.greaterThanOrEqual(8);
          expect(existent.exists).to.equal(true);
        });
      });
    });

    describe('Group Helper', () => {
      describe('getList', async () => {
        it('should return an empty array if there are no events', async () => {
          const events = await client.event.group.getList(18448720);

          expect(events).to.not.equal(undefined);
          expect(events).to.not.equal(null);
          expect(events.length).to.equal(0);
        });

        it('should return an array if there are events', async () => {
          const events = await client.event.group.getList(1915722);

          expect(events).to.not.equal(undefined);
          expect(events).to.not.equal(null);
          expect(events.length).to.greaterThan(0);

          const event = events.find((event) => event.id === 78516);

          expect(event).to.not.equal(undefined);
          expect(event).to.not.equal(null);
          expect(event.id).to.equal(78516);
          expect(event.title).to.equal('Live Comedy - Ann Van Epps');
          expect(event.category).to.equal(null);
          expect(event.shortDescription).to.equal('Holiday Comedy Celebration ');
          expect(event.longDescription).to.not.equal(undefined);
          expect(event.longDescription).to.not.equal(null);
          expect(event.imageUrl).to.equal('https://df49rkfq0koe8.cloudfront.net/event/78516/da52a55f95c54dbeac21573b1fc38462_original.jpeg');
          expect(event.startsAt).to.not.equal(undefined);
          expect(event.startsAt).to.not.equal(null);
          expect(event.endsAt).to.not.equal(undefined);
          expect(event.endsAt).to.not.equal(null);
          expect(event.endsAt).to.not.equal(event.startsAt);
          expect(event.isRemoved).to.equal(false);
          expect(event.attendanceCount).to.greaterThan(0);
          expect(event.exists).to.equal(true);
        });
      });

      describe('create', async () => {
        it('should create an event', async () => {
          const response = await client.event.group.create(18448720,
            {
              title: 'This is a test event',
              shortDescription: 'This is a short desc',
              longDescription: 'This is a very long test description?',
              startsAt: Date.now() + 5000,
              endsAt: Date.now() + 6000000
            }
          );

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);

          eventId = response.body.id;
        });
      });

      describe('update', () => {
        it('should update an event', async () => {
          const response = await client.event.group.update(
            18448720,
            eventId,
            {
              title: 'Title update',
              shortDescription: 'Short desciption update',
              longDescription: 'Long desciption update'
            }
          );

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('updateThumbnail', () => {
        it('should update an event thumbnail', async () => {
          const response = await client.event.group.updateThumbnail(
            eventId,
            fs.readFileSync('D:/Images/testavi.jpg')
          );

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('delete', () => {
        it('should delete an event', async () => {
          const response = await client.event.group.delete(18448720, eventId);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });
    });

    describe('Subscription', () => {
      describe('getList', () => {
        it('should return an empty array if not subscribed to any events', async () => {
          const subscriptions = await client.event.subscription.getList();

          expect(subscriptions).to.not.equal(undefined);
          expect(subscriptions).to.not.equal(null);
          expect(subscriptions.length).to.equal(0);
        });
        it('should return an array if subscribed to any events', async () => {
          await client.event.subscription.add(78516);

          const subscriptions = await client.event.subscription.getList();

          expect(subscriptions).to.not.equal(undefined);
          expect(subscriptions).to.not.equal(null);
          expect(subscriptions.length).to.equal(1);

          await client.event.subscription.remove(78516);
        });
      });

      describe('add', () => {
        it('should add a subscription', async () => {
          const response = await client.event.subscription.add(78516);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('remove', () => {
        it('should remove a subscription', async () => {
          const response = await client.event.subscription.remove(78516);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });
    });
  });

  describe('Group', () => {
    describe('Group Helper', () => {

        describe('list', () => {
          it('should return a list of all joined groups', async () => {
            const groups = await client.group.list();

            expect(groups).to.not.equal(undefined);
            expect(groups).to.not.equal(null);
            expect(groups.length).to.greaterThanOrEqual(0);

            for (const group of groups) {
              expect(group).to.not.equal(undefined);
              expect(group).to.not.equal(null);
              expect(group.inGroup).to.equal(true);
              expect(group.exists).to.equal(true);
            }
          });
        });

        describe('getById', () => {
          it('should return a group if it does not exist', async () => {
            const group = await client.group.getById(43242342);

            expect(group).to.not.equal(undefined);
            expect(group).to.not.equal(null);
            expect(group.exists).to.equal(false);
          });

          it('should return a group if it exists', async () => {
            const group = await client.group.getById(18448720);

            expect(group).to.not.equal(undefined);
            expect(group).to.not.equal(null);
            expect(group.id).to.equal(18448720);
            expect(group.description).to.equal('Test update -1');
            expect(group.hash).to.not.equal(undefined);
            expect(group.hash).to.not.equal(null);
            expect(group.icon).to.greaterThanOrEqual(0);
            expect(group.iconInfo).to.not.equal(undefined);
            expect(group.iconInfo).to.not.equal(null);
            expect(group.iconInfo.availableSizes).to.not.equal(null);
            expect(group.iconInfo.availableSizes).to.not.equal(undefined);
            expect(group.iconInfo.availableSizes.small).to.not.equal(null);
            expect(group.iconInfo.availableSizes.small).to.not.equal(undefined);

            const iconHash = group.iconInfo.availableSizes.small.split('/').filter(Boolean)[3];

            expect(group.iconHash).to.equal(iconHash);
            expect(group.membersCount).to.greaterThan(0);
            expect(group.name).to.equal('unofficial bots');
            expect(group.official).to.be.a('boolean');
            expect(group.owner).to.not.equal(null);
            expect(group.owner).to.not.equal(undefined);
            expect(group.owner.id).to.equal(80280172);

            const owner = await client.subscriber.getById(group.owner.id);

            expect(group.owner.hash).to.equal(owner.hash);
            expect(group.peekable).to.be.a('boolean');
            expect(group.premium).to.be.a('boolean');
            expect(group.reputation).to.greaterThan(0);
            expect(group.extended).to.not.equal(null);
            expect(group.extended).to.not.equal(undefined);
            expect(group.extended.advancedAdmin).to.be.a('boolean');
            expect(group.extended.category).to.greaterThanOrEqual(0);
            expect(group.extended.discoverable).to.be.a('boolean');
            expect(group.extended.entryLevel).to.greaterThanOrEqual(0);
            expect(group.extended.id).to.equal(18448720);
            expect(group.extended.language).to.greaterThanOrEqual(0);
            expect(group.extended.locked).to.be.a('boolean');
            expect(group.extended.passworded).to.be.a('boolean');
            expect(group.extended.questionable).to.be.a('boolean');
            expect(group.messageConfig.id).to.equal(18448720);
            expect(group.messageConfig.disableHyperlink).to.be.a('boolean');
            expect(group.messageConfig.disableImage).to.be.a('boolean');
            expect(group.messageConfig.disableImageFilter).to.be.a('boolean');
            expect(group.messageConfig.disableVoice).to.be.a('boolean');
            expect(group.messageConfig.slowModeRateInSeconds).to.equal(0);
            expect(group.audioConfig.enabled).to.be.a('boolean');
            expect(group.audioConfig.id).to.equal(18448720);
            expect(group.audioConfig.minRepLevel).to.greaterThanOrEqual(0);
            expect(group.audioConfig.stageId).to.satisfy((id) => id === null || id >= 0);
            expect(group.audioCounts.id).to.equal(18448720);
            expect(group.audioCounts.broadcasterCount).to.greaterThanOrEqual(0);
            expect(group.audioCounts.consumerCount).to.greaterThanOrEqual(0);
            expect(group.exists).to.equal(true);
          });
        });

        describe('getByIds', () => {
          it('should return a group if it exists', async () => {
            const groups = await client.group.getByIds([18448720, 432423423]);

            const existent = groups.find((group) => group.id === 18448720);

            expect(existent).to.not.equal(undefined);
            expect(existent).to.not.equal(null);
            expect(existent.id).to.equal(18448720);
            expect(existent.description).to.equal('Test update -1');
            expect(existent.hash).to.not.equal(undefined);
            expect(existent.hash).to.not.equal(null);
            expect(existent.icon).to.greaterThanOrEqual(0);
            expect(existent.iconInfo).to.not.equal(undefined);
            expect(existent.iconInfo).to.not.equal(null);
            expect(existent.iconInfo.availableSizes).to.not.equal(null);
            expect(existent.iconInfo.availableSizes).to.not.equal(undefined);
            expect(existent.iconInfo.availableSizes.small).to.not.equal(null);
            expect(existent.iconInfo.availableSizes.small).to.not.equal(undefined);

            const iconHash = existent.iconInfo.availableSizes.small.split('/').filter(Boolean)[3];

            expect(existent.iconHash).to.equal(iconHash);
            expect(existent.membersCount).to.greaterThan(0);
            expect(existent.name).to.equal('unofficial bots');
            expect(existent.official).to.be.a('boolean');
            expect(existent.owner).to.not.equal(null);
            expect(existent.owner).to.not.equal(undefined);
            expect(existent.owner.id).to.equal(80280172);

            const owner = await client.subscriber.getById(existent.owner.id);

            expect(existent.owner.hash).to.equal(owner.hash);
            expect(existent.peekable).to.be.a('boolean');
            expect(existent.premium).to.be.a('boolean');
            expect(existent.reputation).to.greaterThan(0);
            expect(existent.extended).to.not.equal(null);
            expect(existent.extended).to.not.equal(undefined);
            expect(existent.extended.advancedAdmin).to.be.a('boolean');
            expect(existent.extended.category).to.greaterThanOrEqual(0);
            expect(existent.extended.discoverable).to.be.a('boolean');
            expect(existent.extended.entryLevel).to.greaterThanOrEqual(0);
            expect(existent.extended.id).to.equal(18448720);
            expect(existent.extended.language).to.greaterThanOrEqual(0);
            expect(existent.extended.locked).to.be.a('boolean');
            expect(existent.extended.passworded).to.be.a('boolean');
            expect(existent.extended.questionable).to.be.a('boolean');
            expect(existent.messageConfig.id).to.equal(18448720);
            expect(existent.messageConfig.disableHyperlink).to.be.a('boolean');
            expect(existent.messageConfig.disableImage).to.be.a('boolean');
            expect(existent.messageConfig.disableImageFilter).to.be.a('boolean');
            expect(existent.messageConfig.disableVoice).to.be.a('boolean');
            expect(existent.messageConfig.slowModeRateInSeconds).to.equal(0);
            expect(existent.audioConfig.enabled).to.be.a('boolean');
            expect(existent.audioConfig.id).to.equal(18448720);
            expect(existent.audioConfig.minRepLevel).to.greaterThanOrEqual(0);
            expect(existent.audioConfig.stageId).to.satisfy((id) => id === null || id >= 0);
            expect(existent.audioCounts.id).to.equal(18448720);
            expect(existent.audioCounts.broadcasterCount).to.greaterThanOrEqual(0);
            expect(existent.audioCounts.consumerCount).to.greaterThanOrEqual(0);
            expect(existent.exists).to.equal(true);

            const nonExistent = groups.find((group) => group.id === 432423423);

            expect(nonExistent).to.not.equal(undefined);
            expect(nonExistent).to.not.equal(null);
            expect(nonExistent.exists).to.equal(false);
          });
        });

        describe('getByName', () => {
          it('should return a group if it does not exist', async () => {
            const group = await client.group.getByName('boobs');

            expect(group).to.not.equal(undefined);
            expect(group).to.not.equal(null);
            expect(group.exists).to.equal(false);
          });

          it('should return a group if it exists', async () => {
            const group = await client.group.getByName('unofficial bots', true, true);

            expect(group).to.not.equal(undefined);
            expect(group).to.not.equal(null);
            expect(group.id).to.equal(18448720);
            expect(group.description).to.equal('Test update -1');
            expect(group.hash).to.not.equal(undefined);
            expect(group.hash).to.not.equal(null);
            expect(group.icon).to.greaterThanOrEqual(0);
            expect(group.iconInfo).to.not.equal(undefined);
            expect(group.iconInfo).to.not.equal(null);
            expect(group.iconInfo.availableSizes).to.not.equal(null);
            expect(group.iconInfo.availableSizes).to.not.equal(undefined);
            expect(group.iconInfo.availableSizes.small).to.not.equal(null);
            expect(group.iconInfo.availableSizes.small).to.not.equal(undefined);

            const iconHash = group.iconInfo.availableSizes.small.split('/').filter(Boolean)[3];

            expect(group.iconHash).to.equal(iconHash);
            expect(group.membersCount).to.greaterThan(0);
            expect(group.name).to.equal('unofficial bots');
            expect(group.official).to.be.a('boolean');
            expect(group.owner).to.not.equal(null);
            expect(group.owner).to.not.equal(undefined);
            expect(group.owner.id).to.equal(80280172);

            const owner = await client.subscriber.getById(group.owner.id);

            expect(group.owner.hash).to.equal(owner.hash);
            expect(group.peekable).to.be.a('boolean');
            expect(group.premium).to.be.a('boolean');
            expect(group.reputation).to.greaterThan(0);
            expect(group.extended).to.not.equal(null);
            expect(group.extended).to.not.equal(undefined);
            expect(group.extended.advancedAdmin).to.be.a('boolean');
            expect(group.extended.category).to.greaterThanOrEqual(0);
            expect(group.extended.discoverable).to.be.a('boolean');
            expect(group.extended.entryLevel).to.greaterThanOrEqual(0);
            expect(group.extended.id).to.equal(18448720);
            expect(group.extended.language).to.greaterThanOrEqual(0);
            expect(group.extended.locked).to.be.a('boolean');
            expect(group.extended.passworded).to.be.a('boolean');
            expect(group.extended.questionable).to.be.a('boolean');
            expect(group.messageConfig.id).to.equal(18448720);
            expect(group.messageConfig.disableHyperlink).to.be.a('boolean');
            expect(group.messageConfig.disableImage).to.be.a('boolean');
            expect(group.messageConfig.disableImageFilter).to.be.a('boolean');
            expect(group.messageConfig.disableVoice).to.be.a('boolean');
            expect(group.messageConfig.slowModeRateInSeconds).to.equal(0);
            expect(group.audioConfig.enabled).to.be.a('boolean');
            expect(group.audioConfig.id).to.equal(18448720);
            expect(group.audioConfig.minRepLevel).to.greaterThanOrEqual(0);
            expect(group.audioConfig.stageId).to.satisfy((id) => id === null || id >= 0);
            expect(group.audioCounts.id).to.equal(18448720);
            expect(group.audioCounts.broadcasterCount).to.greaterThanOrEqual(0);
            expect(group.audioCounts.consumerCount).to.greaterThanOrEqual(0);
            expect(group.exists).to.equal(true);
          });
        });

        describe('joinById', async () => {
          it('should join a group if it exists and does not have a password', async () => {
            const response = await client.group.joinById(18448720);

            await client.group.leaveById(18448720);
            expect(response).to.not.equal(undefined);
            expect(response).to.not.equal(null);
            expect(response.success).to.equal(true);
          });
        });

        describe('joinByName', async () => {
          it('should join a group if it exists and does not have a password', async () => {
            const response = await client.group.joinByName('unofficial bots');

            await client.group.leaveByName('unofficial bots');
            expect(response).to.not.equal(undefined);
            expect(response).to.not.equal(null);
            expect(response.success).to.equal(true);
          });
        });

        describe('getStats', async () => {
          it('should return undefined if a group doesnt exist', async () => {
            const stats = await client.group.getStats(431432421);

            expect(stats).to.equal(undefined);
          });

          it('should return a group status object if a group doesnt exist', async () => {
            const stats = await client.group.getStats(18448720);

            expect(stats).to.not.equal(undefined);
            expect(stats).to.not.equal(null);

            expect(stats.details).to.not.equal(undefined);
            expect(stats.details).to.not.equal(null);

            expect(stats.next30).to.not.equal(undefined);
            expect(stats.next30).to.not.equal(null);

            expect(stats.top25).to.not.equal(undefined);
            expect(stats.top25).to.not.equal(null);

            expect(stats.topAction).to.not.equal(undefined);
            expect(stats.topAction).to.not.equal(null);

            expect(stats.topEmoticon).to.not.equal(undefined);
            expect(stats.topEmoticon).to.not.equal(null);

            expect(stats.topHappy).to.not.equal(undefined);
            expect(stats.topHappy).to.not.equal(null);

            expect(stats.topImage).to.not.equal(undefined);
            expect(stats.topImage).to.not.equal(null);

            expect(stats.topQuestion).to.not.equal(undefined);
            expect(stats.topQuestion).to.not.equal(null);

            expect(stats.topSad).to.not.equal(undefined);
            expect(stats.topSad).to.not.equal(null);

            expect(stats.topSwear).to.not.equal(undefined);
            expect(stats.topSwear).to.not.equal(null);

            expect(stats.topText).to.not.equal(undefined);
            expect(stats.topText).to.not.equal(null);

            expect(stats.topWord).to.not.equal(undefined);
            expect(stats.topWord).to.not.equal(null);

            expect(stats.trends).to.not.equal(undefined);
            expect(stats.trends).to.not.equal(null);

            for (const trendsDay of stats.trendsDay) {
              expect(trendsDay).to.not.equal(undefined);
              expect(trendsDay).to.not.equal(null);

              expect(trendsDay.day).to.greaterThanOrEqual(0);
              expect(trendsDay.lineCount).to.greaterThanOrEqual(0);
            }

            expect(stats.trendsDay).to.not.equal(undefined);
            expect(stats.trendsDay).to.not.equal(null);

            for (const trendsDay of stats.trendsDay) {
              expect(trendsDay).to.not.equal(undefined);
              expect(trendsDay).to.not.equal(null);

              expect(trendsDay.day).to.greaterThanOrEqual(0);
              expect(trendsDay.lineCount).to.greaterThanOrEqual(0);
            }

            expect(stats.trendsHour).to.not.equal(undefined);
            expect(stats.trendsHour).to.not.equal(null);

            for (const trendHour of stats.trendsHour) {
              expect(trendHour).to.not.equal(undefined);
              expect(trendHour).to.not.equal(null);

              expect(trendHour.hour).to.greaterThanOrEqual(0);
              expect(trendHour.lineCount).to.greaterThanOrEqual(0);
            }
          });
        });

        describe('getRecommendationList', async () => {
          it('should return an array of group profiles', async () => {
            const recommendations = await client.group.getRecommendationList();

            expect(recommendations).to.not.equal(undefined);
            expect(recommendations).to.not.equal(null);

            for (const group of recommendations) {
              expect(group).to.not.equal(undefined);
              expect(group).to.not.equal(null);
              expect(group).to.be.an.instanceOf(Group);
            }
          });
        });

        describe('getChatHistory', async () => {
          it('should return an empty array if no history is available', async () => {
            const history = await client.group.getChatHistory(431432421);

            expect(history).to.not.equal(undefined);
            expect(history).to.not.equal(null);
            expect(history.length).to.equal(0);
          });

          it('should return an array of messages history is available', async () => {
            const history = await client.group.getChatHistory(18448720);

            expect(history).to.not.equal(undefined);
            expect(history).to.not.equal(null);
            expect(history.length).to.greaterThan(0);

            for (const message of history) {
              expect(message).to.not.equal(undefined);
              expect(message).to.not.equal(null);
              expect(message).to.be.an.instanceOf(Message);
            }

            const historyAfter = await client.group.getChatHistory(18448720, false, history.slice(-1)[0].timestamp);

            expect(historyAfter).to.not.equal(undefined);
            expect(historyAfter).to.not.equal(null);
            expect(historyAfter.length).to.greaterThan(0);

            for (const message of historyAfter) {
              expect(message).to.not.equal(undefined);
              expect(message).to.not.equal(null);
              expect(message).to.be.an.instanceOf(Message);
              expect(history).to.not.deep.include(message);
            }
          });
        });

      describe('search', async () => {
        it('should return an empty array if no search results exist', async () => {
          const results = await client.group.search('fgfdgdgdgfdgfdgfdgfdgfdgfdgfhgjhgjhgjh');

          expect(results).to.not.equal(undefined);
          expect(results).to.not.equal(null);
          expect(results.length).to.equal(0);
        });

        it('should return an array if search results exist', async () => {
          const results = await client.group.search('unofficial bots');

          expect(results).to.not.equal(undefined);
          expect(results).to.not.equal(null);
          expect(results.length).to.greaterThan(0);
        });
      });
    });
  });
  describe('Log', () => {
    describe('Log Helper', () => {
      describe('debug', () => {
        it('should emit a debug event', (done) => {
          client.once('log', (log) => {
            expect(log).to.not.equal(undefined);
            expect(log).to.not.equal(null);
            expect(log.level).to.equal(LogLevel.DEBUG);
            expect(log.message).to.equal('test');
            done();
          });

          client.log.debug('test');
        });
      });

      describe('error', () => {
        it('should emit a error event', (done) => {
          client.once('log', (log) => {
            expect(log).to.not.equal(undefined);
            expect(log).to.not.equal(null);
            expect(log.level).to.equal(LogLevel.ERROR);
            expect(log.message).to.equal('test');
            done();
          });

          client.log.error('test');
        });
      });

      describe('info', () => {
        it('should emit a error event', (done) => {
          client.once('log', (log) => {
            expect(log).to.not.equal(undefined);
            expect(log).to.not.equal(null);
            expect(log.level).to.equal(LogLevel.INFO);
            expect(log.message).to.equal('test');
            done();
          });

          client.log.info('test');
        });
      });

      describe('warn', () => {
        it('should emit a warn event', (done) => {
          client.once('log', (log) => {
            expect(log).to.not.equal(undefined);
            expect(log).to.not.equal(null);
            expect(log.level).to.equal(LogLevel.WARN);
            expect(log.message).to.equal('test');
            done();
          });

          client.log.warn('test');
        });
      });
    });
  });

  describe('Messaging', () => {

    describe('Messaging Helper', () => {
      describe('sendGroupMessage', () => {
        it('should send a text message', async () => {
          const response = await client.messaging.sendGroupMessage(groupId, 'hello from V2');

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
        it('should send a image message', async () => {
          const response = await client.messaging.sendGroupMessage(groupId, fs.readFileSync('D:/images/testavi.jpg'));

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });

        it('should send a voice message', async () => {
          const response = await client.messaging.sendGroupMessage(groupId, fs.readFileSync('D:/audio/testvm.m4a'));

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });
      describe('sendPrivateMessage', () => {
        it('should send a text message', async () => {
          const response = await client.messaging.sendPrivateMessage(subscriberId, 'hello from V2');

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });

        it('should send a image message', async () => {
          const response = await client.messaging.sendPrivateMessage(subscriberId, fs.readFileSync('D:/images/testavi.jpg'));

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });

        it('should send a voice message', async () => {
          const response = await client.messaging.sendPrivateMessage(subscriberId, fs.readFileSync('D:/audio/testvm.m4a'));

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('sendMessage', () => {
        //
      });

      describe('getGroupMessageEditHistory', () => {
        it('should return an empty array if no history exists', async () => {
          const history = await client.messaging.getGroupMessageEditHistory(groupId, timestamp - 100);

          expect(history).to.not.equal(undefined);
          expect(history).to.not.equal(null);
          expect(history.length).to.equal(0);
        });

        it('should return an empty array of edits if history exists', async () => {
          const history = await client.messaging.getGroupMessageEditHistory(groupId, timestamp);

          expect(history).to.not.equal(undefined);
          expect(history).to.not.equal(null);
          expect(history.length).to.greaterThan(0);
        });
      });

      describe('deleteGroupMessage', () => {
        it('should delete the message', async () => {
          const response = await client.messaging.deleteGroupMessage(groupId, timestamp);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });

      describe('restoreGroupMessage', () => {
        it('should restore the message', async () => {
          const response = await client.messaging.restoreGroupMessage(groupId, timestamp);

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });
    });

    describe('Messaging Subscription Helper', () => {
      describe('nextMessage', () => {
        it('should get the next message', async () => {
          const message = await client.messaging.subscription.nextMessage((message) => message.sourceSubscriberId === subscriberId);

          expect(message).to.not.equal(undefined);
          expect(message).to.not.equal(null);
          console.log(message);
          expect(message.sourceSubscriberId).to.equal(subscriberId);
        });

        it('should timeout the next message', async () => {
          const message = await client.messaging.subscription.nextMessage((message) => message.sourceSubscriberId === subscriberId, 1000);

          expect(message).to.not.equal(undefined);
          expect(message).to.equal(null);
        });
      });

      describe('nextGroupMessage', () => {
        it('should get the next group message', async () => {
          const message = await client.messaging.subscription.nextGroupMessage(groupId);

          expect(message).to.not.equal(undefined);
          expect(message).to.not.equal(null);
          console.log(message);
          expect(message.targetGroupId).to.equal(groupId);
        });

        it('should timeout the next group message', async () => {
          const message = await client.messaging.subscription.nextGroupMessage(groupId, 1000);

          expect(message).to.not.equal(undefined);
          expect(message).to.equal(null);
        });
      });

      describe('nextPrivateMessage', () => {
        it('should get the next private message', async () => {
          const message = await client.messaging.subscription.nextPrivateMessage(message.sourceSubscriberId);

          expect(message).to.not.equal(undefined);
          expect(message).to.not.equal(null);
          console.log(message);
          expect(message.sourceSubscriberId).to.equal(subscriberId);
        });

        it('should timeout the next private message', async () => {
          const message = await client.messaging.subscription.nextPrivateMessage(message.sourceSubscriberId, 1000);

          expect(message).to.not.equal(undefined);
          expect(message).to.equal(null);
        });
      });

      describe('nextGroupSubscriberMessage', () => {
        it('should get the next private message', async () => {
          const message = await client.messaging.subscription.nextGroupSubscriberMessage(groupId, subscriberId);

          expect(message).to.not.equal(undefined);
          expect(message).to.not.equal(null);
          console.log(message);
          expect(message.sourceSubscriberId).to.equal(subscriberId);
        });

        it('should timeout the next private message', async () => {
          const message = await client.messaging.subscription.nextGroupSubscriberMessage(groupId, subscriberId, 1000);

          expect(message).to.not.equal(undefined);
          expect(message).to.equal(null);
        });
      });

    });
  });

  describe('Misc', () => {
    describe('Misc Helper', () => {
      describe('metadata', () => {
        it('should return a metadata object', async () => {
          const metadata = await client.misc.metadata('https://media.tenor.com/Dlb7NqumGLMAAAAi/dino-dinosaur.gif');

          expect(metadata).to.not.equal(undefined);
          expect(metadata).to.not.equal(null);

          // This all sets
        });
      });

      /*
      describe('linkBlacklist', () => {
        it('should return an array of blacklisted links', async () => {
          const blacklisted = await client.misc.linkBlacklist();

          expect(blacklisted).to.not.equal(undefined);
          expect(blacklisted).to.not.equal(null);
          expect(blacklisted.length).to.greaterThan(0);

          expect(blacklisted[0].id).to.not.equal(undefined);
          expect(blacklisted[0].id).to.not.equal(null);

          expect(blacklisted[0].regex).to.not.equal(undefined);
          expect(blacklisted[0].regex).to.not.equal(null);
        });
      });
      describe('getSecurityToken', () => {
        it('should return a cognito token', async () => {
          const cognito = await client.misc.getSecurityToken();

          expect(cognito).to.not.equal(undefined);
          expect(cognito).to.not.equal(null);

          expect(cognito.token).to.not.equal(undefined);
          expect(cognito.token).to.not.equal(null);

          expect(cognito.identity).to.not.equal(undefined);
          expect(cognito.identity).to.not.equal(null);
        });
      });
      describe('getMessageSettings', () => {
        it('should get message settings', async () => {
          const settings = await client.misc.getMessageSettings();

          expect(settings).to.not.equal(undefined);
          expect(settings).to.not.equal(null);

          expect(settings.spamFilter).to.not.equal(undefined);
          expect(settings.spamFilter).to.not.equal(null);

          expect(settings.spamFilter.enabled).to.be.a('boolean');
          expect(settings.spamFilter.tier).to.greaterThanOrEqual(0);
        });
      });

      describe('updateMessageSettings', () => {
        it('should update message settings', async () => {
          await client.misc.updateMessageSettings(MessageFilterTier.STRICT);

          const settings = await client.misc.getMessageSettings();

          expect(settings).to.not.equal(undefined);
          expect(settings).to.not.equal(null);

          expect(settings.spamFilter).to.not.equal(undefined);
          expect(settings.spamFilter).to.not.equal(null);

          expect(settings.spamFilter.enabled).to.equal(true);
          expect(settings.spamFilter.tier).to.equal(MessageFilterTier.STRICT);
        });
      });
    });
  });

  describe('Notification', () => {
    describe('Notification Helper', () => {
      describe('list', () => {
        // This is going to be hard to test
        it('should return a list of notifications', async () => {
          const notifications = await client.notification.list();

          expect(notifications).to.not.equal(undefined);
          expect(notifications).to.not.equal(null);
          expect(notifications.length).to.greaterThanOrEqual(0);

          for (const notification of notifications) {
            expect(notification).to.not.equal(undefined);
            expect(notification).to.not.equal(null);
          }
        });
      });

      describe('clear', () => {
        it('should clear the notification list', async () => {
          const response = await client.notification.clear();

          expect(response).to.not.equal(undefined);
          expect(response).to.not.equal(null);
          expect(response.success).to.equal(true);
        });
      });
    });

  });
  describe('Phrase', () => {
    describe('Phrase Helper', () => {
      describe('load', () => {
        it('should load phrases', async () => {
          await client.phrase.load([
            {
              name: 'hello',
              value: 'goodbye',
              language: 'en'
            }
          ]);

          expect(client.phrase.phrases).to.deep.include({
            name: 'hello',
            value: 'goodbye',
            language: 'en'
          });
        });
      });

      describe('count', () => {

      });

      describe('getAllByName', () => {
        it('should return an empty array if none exist', async () => {
          const phrases = await client.phrase.getAllByName('fdafsdfsafa');

          expect(phrases).to.not.equal(undefined);
          expect(phrases).to.not.equal(null);
          expect(phrases.length).to.equal(0);
        });

        it('should return an array if phrases exist', async () => {
          const phrases = await client.phrase.getAllByName('hello');

          expect(phrases).to.not.equal(undefined);
          expect(phrases).to.not.equal(null);
          expect(phrases.length).to.equal(1);
        });
      });

      describe('getByLanguageAndName', () => {
        it('should return a string phrase if it exists', async () => {
          const phrase = await client.phrase.getByLanguageAndName('en', 'hello');

          expect(phrase).to.not.equal(undefined);
          expect(phrase).to.not.equal(null);
          expect(phrase).to.equal('goodbye');
        });
      });

      describe('getByCommandAndName', () => {
        // This works
      });

      describe('isRequestedPhrase', () => {
        it('should return true if it matches', async () => {
          const input = 'goodbye';
          const result = await client.phrase.isRequestedPhrase('hello', input);

          expect(result).to.not.equal(undefined);
          expect(result).to.not.equal(null);
          expect(result).to.equal(true);
        });
        it('should return false if it doesnt match', async () => {
          const input = 'good-bye';
          const result = await client.phrase.isRequestedPhrase('hello', input);

          expect(result).to.not.equal(undefined);
          expect(result).to.not.equal(null);
          expect(result).to.equal(false);
        });
      });
    });
  });

*/
  describe('Stage', () => {

  });

  describe('Store', () => {
    describe('Store Helper', () => {
      describe('getCreditList', () => {
        // Worked during dev.
      });

      describe('get', () => {

        // Worked during dev.
      });

      describe('getProducts', () => {

        // Worked during dev.
      });

      describe('getFullProduct', () => {

        // Worked during dev.
      });

      describe('purchase', () => {

        // Worked during dev.
      });

      describe('getCreditBalance', () => {

        // Worked during dev.
      });
    });
  });

  describe('Subscriber', () => {
    describe('Subscriber Helper', () => {
      describe('getById', () => {
        it('should return a group if it does not exist', async () => {
          const subscriber = await client.subscriber.getById(4324452342);

          expect(subscriber).to.not.equal(undefined);
          expect(subscriber).to.not.equal(null);
          expect(subscriber.exists).to.equal(false);
        });

        it('should return a group if it exists', async () => {
          const subscriber = await client.subscriber.getById(12952203);

          // Works
        });
      });

      describe('getByIds', () => {

        // Worked during dev.
      });

      describe('getChatHistory', () => {
        it('should return an empty array if no history is available', async () => {
          const history = await client.subscriber.getChatHistory(431432421);

          expect(history).to.not.equal(undefined);
          expect(history).to.not.equal(null);
          expect(history.length).to.equal(0);
        });

        it('should return an array of messages history is available', async () => {
          const history = await client.subscriber.getChatHistory(80280172);

          expect(history).to.not.equal(undefined);
          expect(history).to.not.equal(null);
          expect(history.length).to.greaterThan(0);

          for (const message of history) {
            expect(message).to.not.equal(undefined);
            expect(message).to.not.equal(null);
            expect(message).to.be.an.instanceOf(Message);
          }

          const historyAfter = await client.subscriber.getChatHistory(80280172, history.slice(-1)[0].timestamp);

          expect(historyAfter).to.not.equal(undefined);
          expect(historyAfter).to.not.equal(null);
          expect(historyAfter.length).to.greaterThan(0);

          for (const message of historyAfter) {
            expect(message).to.not.equal(undefined);
            expect(message).to.not.equal(null);
            expect(message).to.be.an.instanceOf(Message);
            expect(history).to.not.deep.include(message);
          }
        });
      });

      describe('search', () => {
        it('should return an empty array if no search results exist', async () => {
          const results = await client.subscriber.search('fgfdgdgdgfdgfdgfdgfdgfdgfdgfhgjhgjhgjh');

          expect(results).to.not.equal(undefined);
          expect(results).to.not.equal(null);
          expect(results.length).to.equal(0);
        });

        it('should return an array if search results exist', async () => {
          const results = await client.subscriber.search('Dew');

          expect(results).to.not.equal(undefined);
          expect(results).to.not.equal(null);
          expect(results.length).to.greaterThan(0);
        });
      });
    });

    describe('Presence Helper', () => {
      describe('getById', () => {
        // Works
      });

      describe('getByIds', () => {

        // Works
      });
    });

    describe('Wolfstar Helper', () => {
      describe('getById', () => {

        // Works
      });

      describe('getByIds', () => {

        // Works
      });
    });
  });

  describe('Tipping', () => {
    describe('Tipping Helper', () => {
      describe('tip', () => {

        // Works
      });

      describe('getDetails', () => {
        // Works
      });

      describe('getSummary', () => {
        // Works
      });

      describe('getGroupLeaderboard', () => {
        // Works
      });

      describe('getGroupLeaderboardSummary', () => {
        // Works
      });

      describe('getGlobalLeaderboard', () => {
        // Works
      });

      describe('getGlobalLeaderboardSummary', () => {
        // Works
      });
    });
  });

  describe('Topic', () => {
    describe('Topic Helper', () => {
      describe('getTopicPageLayout', () => {
        // Works
      });

      describe('getTopicPageRecipeList', () => {
        // Works
      });
    });
  });
});
