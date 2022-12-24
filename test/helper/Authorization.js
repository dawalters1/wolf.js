import { WOLF } from '../../index.js';
import { describe, before, after, beforeEach, it } from 'mocha';
import { expect } from 'chai';

describe('Authorization', () => {
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
    await client.authorization.clear();
  });

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
