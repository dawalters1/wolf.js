import { WOLF, Language } from '../../index.js';// eslint-disable-line no-unused-vars
import { describe, before, after, it } from 'mocha';// eslint-disable-line no-unused-vars
import { expect } from 'chai';// eslint-disable-line no-unused-vars

describe('Subscriber', () => {
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

  describe('Subscriber Helper', () => {
    describe('getById', () => {

    });

    describe('getByIds', () => {

    });

    describe('getChatHistory', () => {

    });

    describe('search', () => {

    });
  });

  describe('Presence Helper', () => {
    describe('getById', () => {

    });

    describe('getByIds', () => {

    });
  });

  describe('Wolfstar Helper', () => {
    describe('getById', () => {

    });

    describe('getByIds', () => {

    });
  });
});
