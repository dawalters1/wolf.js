
import { WOLF } from '../../index.js';
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';

const ids = [25129067, 29976610];
const blockedIds = [81175317, 26517517];

describe('Contact', () => {
  const client = new WOLF();

  before(() => {
    const mochaConfig = client._frameworkConfig.get('connection.mocha');

    return new Promise((resolve, reject) => {
      client.on('ready', async () => {
        ids.forEach(async (id) => await client.contact.delete(id));
        blockedIds.forEach(async (blockedId) => await client.contact.blocked.unblock(blockedId));

        resolve();
      });
      client.on('loginFailed', (reason) => reject(reason));

      client.login(mochaConfig.email, mochaConfig.password);
    });
  });

  after(() => client.logout(true));

  describe('Contact Helper', () => {
    describe('add', () => {
      it('should add a contact', async () => {
        const response = await client.contact.add(ids[0]);

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response.success).to.equal(true);
      });
    });

    describe('isContact', () => {
      it('it should return false if id is not a contact', async () => {
        const response = await client.contact.isContact(ids[1]);

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response).to.equal(false);
      });

      it('it should return true if id is not a contact', async () => {
        const response = await client.contact.isContact(ids[0]);

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response).to.equal(true);
      });
    });

    describe('delete', () => {
      it('should delete a contact', async () => {
        const response = await client.contact.delete(ids[0]);

        expect(response).to.not.equal(undefined);
        expect(response).to.not.equal(null);
        expect(response.success).to.equal(true);
      });
    });

    describe('list', () => {
      it('it should return an empty array if no contacts exist', async () => {
        const contacts = await client.contact.list();

        expect(contacts).to.not.equal(undefined);
        expect(contacts).to.not.equal(null);
        expect(contacts.length).to.equal(0);
      });

      it('it should return an array if contacts exists', async () => {
        await client.contact.add(ids[0]);

        const contacts = await client.contact.list();

        expect(contacts).to.not.equal(undefined);
        expect(contacts).to.not.equal(null);
        expect(contacts.length).to.greaterThan(0);

        for (const contact of contacts) {
          expect(contact).to.not.equal(undefined);
          expect(contact).to.not.equal(null);
          expect(contact.id).to.equal(ids[0]);
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
