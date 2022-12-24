import { WOLF } from '../../index.js';
import { describe, before, after, beforeEach, it } from 'mocha';
import { expect } from 'chai';

describe('Banned', () => {
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

  beforeEach(async () => {
    await client.banned.clear();
  });

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
