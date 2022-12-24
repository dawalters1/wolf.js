import { WOLF, Language } from '../../index.js';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';

describe('Achievement', () => {
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
