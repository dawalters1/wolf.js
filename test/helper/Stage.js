import { WOLF, Language } from '../../index.js';// eslint-disable-line no-unused-vars
import { describe, before, after, it } from 'mocha';// eslint-disable-line no-unused-vars
import { expect } from 'chai';// eslint-disable-line no-unused-vars

describe('Stage', () => {
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

  describe('Stage Helper', () => {
  });
});
